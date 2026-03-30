using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using MaterialApi.Infrastructure.ErrorHandling;

namespace MaterialApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductionController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly SapPythonService _sapPythonService;
        private readonly ILogger<ProductionController> _logger;

        public ProductionController(AppDbContext context, IConfiguration configuration, SapPythonService sapPythonService, ILogger<ProductionController> logger)
        {
            _context = context;
            _configuration = configuration;
            _sapPythonService = sapPythonService;
            _logger = logger;
        }

        private Task EnsureCoalDraftTableAsync()
        {
            return _context.Database.ExecuteSqlRawAsync(
                """
                BEGIN
                    EXECUTE IMMEDIATE '
                        CREATE TABLE RAWMATERIALCOALDRAFT (
                            COALID VARCHAR2(100 CHAR) NOT NULL,
                            FROMDATE DATE NULL,
                            MONTHNAME VARCHAR2(50 CHAR) NULL,
                            ENTRYDATE DATE NULL,
                            SOURCE VARCHAR2(255 CHAR) NULL,
                            MATERIALCODE VARCHAR2(255 CHAR) NULL,
                            GATENUMBER VARCHAR2(255 CHAR) NULL,
                            PONUMBER VARCHAR2(255 CHAR) NULL,
                            PARTY VARCHAR2(255 CHAR) NULL,
                            CATEGORY VARCHAR2(255 CHAR) NULL,
                            TRANSPORTER VARCHAR2(255 CHAR) NULL,
                            TRUCKNO VARCHAR2(255 CHAR) NULL,
                            QTYMT NUMBER NULL,
                            MINUS3MM NUMBER NULL,
                            MINUS4MM NUMBER NULL,
                            MINUS6MM NUMBER NULL,
                            MINUS1MM NUMBER NULL,
                            STONES NUMBER NULL,
                            CSHALE NUMBER NULL,
                            SULPHURPCT NUMBER NULL,
                            IM NUMBER NULL,
                            TM NUMBER NULL,
                            VM NUMBER NULL,
                            ASH NUMBER NULL,
                            FCADB NUMBER NULL,
                            FCDB NUMBER NULL,
                            GCVARB NUMBER NULL,
                            GCVADB NUMBER NULL,
                            IMAGEUPLOAD VARCHAR2(1000 CHAR) NULL,
                            REMARKS VARCHAR2(2000 CHAR) NULL,
                            FILLEDBY VARCHAR2(255 CHAR) NULL,
                            LASTSAVEDAT TIMESTAMP(6) NULL,
                            STATUS VARCHAR2(50 CHAR) DEFAULT ''DRAFT'' NOT NULL,
                            CONSTRAINT PK_RAWMATERIALCOALDRAFT PRIMARY KEY (COALID)
                        )';
                EXCEPTION
                    WHEN OTHERS THEN
                        IF SQLCODE != -955 THEN
                            RAISE;
                        END IF;
                END;
                """
            );
        }

        private Task EnsureFormDraftTableAsync()
        {
            return _context.Database.ExecuteSqlRawAsync(
                """
                BEGIN
                    EXECUTE IMMEDIATE '
                        CREATE TABLE APPFORMDRAFT (
                            DRAFTKEY VARCHAR2(200 CHAR) NOT NULL,
                            MODULEKEY VARCHAR2(100 CHAR) NOT NULL,
                            ENTRYID VARCHAR2(100 CHAR) NOT NULL,
                            PAYLOADJSON CLOB NOT NULL,
                            FILLEDBY VARCHAR2(255 CHAR) NULL,
                            LASTSAVEDAT TIMESTAMP(6) NULL,
                            STATUS VARCHAR2(50 CHAR) DEFAULT ''DRAFT'' NOT NULL,
                            CONSTRAINT PK_APPFORMDRAFT PRIMARY KEY (DRAFTKEY)
                        )';
                EXCEPTION
                    WHEN OTHERS THEN
                        IF SQLCODE != -955 THEN
                            RAISE;
                        END IF;
                END;
                """
            );
        }

        private static string BuildFormDraftKey(string moduleKey, string entryId)
            => $"{moduleKey.Trim().ToUpperInvariant()}::{entryId.Trim().ToUpperInvariant()}";

        private async Task DeleteFormDraftAsync(string moduleKey, string entryId)
        {
            if (string.IsNullOrWhiteSpace(moduleKey) || string.IsNullOrWhiteSpace(entryId))
            {
                return;
            }

            await EnsureFormDraftTableAsync();

            var draftKey = BuildFormDraftKey(moduleKey, entryId);
            var existingDraft = await _context.FormDraftEntries.FindAsync(draftKey);
            if (existingDraft == null)
            {
                return;
            }

            _context.FormDraftEntries.Remove(existingDraft);
            await _context.SaveChangesAsync();
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            try
            {
                if (string.IsNullOrEmpty(request.UserId) || string.IsNullOrEmpty(request.Password))
                {
                    return BadRequest(new { message = "User ID and Password are required" });
                }

                var existing = await _context.UserLogins.FindAsync(request.UserId);
                if (existing != null)
                {
                    return BadRequest(new { message = "User already exists" });
                }

                var newUser = new UserLogin
                {
                    UserId = request.UserId,
                    Password = request.Password,
                    Role = request.Role ?? "User",
                    Permissions = request.Permissions ?? "{}"
                };

                _context.UserLogins.Add(newUser);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Registration successful", userId = newUser.UserId });
            }
            catch (Exception)
            {
                throw;
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (string.IsNullOrEmpty(request.UserId) || string.IsNullOrEmpty(request.Password))
            {
                return BadRequest(new { message = "User ID and Password are required" });
            }

            var user = await _context.UserLogins
                .FirstOrDefaultAsync(u => u.UserId.ToLower() == request.UserId.ToLower());

            if (user == null || user.Password != request.Password)
            {
                return Unauthorized(new { message = "Invalid credentials" });
            }

            // Generate JWT token
            var tokenHandler = new JwtSecurityTokenHandler();
            var jwtKey = _configuration["Jwt:Key"];
            if (string.IsNullOrEmpty(jwtKey))
            {
                throw new InvalidOperationException("JWT configuration is missing.");
            }

            var key = Encoding.UTF8.GetBytes(jwtKey);
            var jwtIssuer = _configuration["Jwt:Issuer"];
            var jwtAudience = _configuration["Jwt:Audience"];

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.Name, user.UserId),
                    new Claim(ClaimTypes.Role, user.Role)
                }),
                Expires = DateTime.UtcNow.AddHours(8),
                Issuer = jwtIssuer,
                Audience = jwtAudience,
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key),
                    SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            var tokenString = tokenHandler.WriteToken(token);

            return Ok(new
            {
                token = tokenString,
                userId = user.UserId,
                role = user.Role,
                permissions = user.Permissions ?? "{}"
            });
        }

        [HttpGet("dashboard-summary")]
        public async Task<IActionResult> GetDashboardSummary()
        {
            try
            {
                var coalCount = await _context.CoalEntries.CountAsync();
                var pelletsCount = await _context.PelletEntries.CountAsync();
                var ironOreCount = await _context.IronOreEntries.CountAsync();
                var dolomiteCount = await _context.DolomiteEntries.CountAsync();
                var productionCount = await _context.ProductionEntries.CountAsync();
                var dispatchCount = await _context.DispatchEntries.CountAsync();
                var stockCoalCount = await _context.StockHouseCoal.CountAsync();
                var stockIronOreCount = await _context.StockHouseIronOre.CountAsync();
                var stockDolomiteCount = await _context.StockHouseDolomite.CountAsync();
                var stockCharcoalCount = await _context.StockHouseCharcoal.CountAsync();

                var coalPending = await _context.CoalEntries.CountAsync(x => x.Status == "Pending");
                var pelletsPending = await _context.PelletEntries.CountAsync(x => x.Status == "Pending");
                var ironOrePending = await _context.IronOreEntries.CountAsync(x => x.Status == "Pending");
                var dolomitePending = await _context.DolomiteEntries.CountAsync(x => x.Status == "Pending");
                var productionPending = await _context.ProductionEntries.CountAsync(x => x.Status == "Pending");
                var dispatchPending = await _context.DispatchEntries.CountAsync(x => x.Status == "Pending");
                var stockCoalPending = await _context.StockHouseCoal.CountAsync(x => x.Status == "Pending");
                var stockIronOrePending = await _context.StockHouseIronOre.CountAsync(x => x.Status == "Pending");
                var stockDolomitePending = await _context.StockHouseDolomite.CountAsync(x => x.Status == "Pending");
                var stockCharcoalPending = await _context.StockHouseCharcoal.CountAsync(x => x.Status == "Pending");

                return Ok(new
                {
                    rawMaterial = new
                    {
                        rawCoal = coalCount,
                        rawPellets = pelletsCount,
                        rawIronOre = ironOreCount,
                        rawDolomite = dolomiteCount
                    },
                    production = new { productionTotal = productionCount },
                    stockHouse = new
                    {
                        stockCoal = stockCoalCount,
                        stockIronOre = stockIronOreCount,
                        stockDolomite = stockDolomiteCount,
                        stockCharcoal = stockCharcoalCount
                    },
                    dispatchTotal = dispatchCount,
                    pending = new
                    {
                        coal = coalPending,
                        pellets = pelletsPending,
                        ironOre = ironOrePending,
                        dolomite = dolomitePending,
                        production = productionPending,
                        dispatch = dispatchPending,
                        stockCoal = stockCoalPending,
                        stockIronOre = stockIronOrePending,
                        stockDolomite = stockDolomitePending,
                        stockCharcoal = stockCharcoalPending
                    }
                });
            }
            catch (Exception)
            {
                throw;
            }
        }

        [HttpGet("get-all-data")]
        public async Task<IActionResult> GetAllData()
        {
            try
            {
                var coal = await _context.CoalEntries.ToListAsync();
                await EnsureCoalDraftTableAsync();
                var coalDrafts = await _context.CoalDraftEntries.ToListAsync();
                var pellets = await _context.PelletEntries.ToListAsync();
                var ironOre = await _context.IronOreEntries.ToListAsync();
                var dolomite = await _context.DolomiteEntries.ToListAsync();
                var production = await _context.ProductionEntries.ToListAsync();
                var dispatch = await _context.DispatchEntries.ToListAsync();
                var stockCoal = await _context.StockHouseCoal.ToListAsync();
                var stockIronOre = await _context.StockHouseIronOre.ToListAsync();
                var stockDolomite = await _context.StockHouseDolomite.ToListAsync();
                var stockCharcoal = await _context.StockHouseCharcoal.ToListAsync();
                var byProduct = await _context.ByProductDolochars.ToListAsync();

                return Ok(new
                {
                    coal,
                    coalDrafts,
                    pellets,
                    ironOre,
                    dolomite,
                    production,
                    dispatch,
                    stockCoal,
                    stockIronOre,
                    stockDolomite,
                    stockCharcoal,
                    byProductDolochar = byProduct
                });
            }
            catch (Exception)
            {
                throw;
            }
        }

        [HttpGet("get-next-id")]
        public async Task<IActionResult> GetNextId([FromQuery] string material)
        {
            var prefix = material?.ToUpper() switch
            {
                "COAL" => "RMC",
                "PELLETS" => "RMP",
                "IRON_ORE" => "RMI",
                "DOLOMITE" => "RMD",
                _ => "RM"
            };
            var now = DateTime.Now;
            var datePrefix = $"{now:MMddyy}{now:HH}";
            var pattern = $"{prefix}{datePrefix}";

            int maxSerial = 0;
            if (material?.ToUpper() == "COAL")
            {
                await EnsureCoalDraftTableAsync();

                var existing = await _context.CoalEntries
                    .Where(x => x.CoalId.StartsWith(pattern))
                    .Select(x => x.CoalId)
                    .ToListAsync();

                var existingDrafts = await _context.CoalDraftEntries
                    .Where(x => x.CoalId.StartsWith(pattern))
                    .Select(x => x.CoalId)
                    .ToListAsync();

                maxSerial = existing
                    .Concat(existingDrafts)
                    .Select(id => int.TryParse(id.Substring(pattern.Length), out var num) ? num : 0)
                    .DefaultIfEmpty(0)
                    .Max();
            }
            else if (material?.ToUpper() == "PELLETS")
            {
                await EnsureFormDraftTableAsync();
                var existing = await _context.PelletEntries
                    .Where(x => x.PelletId.StartsWith(pattern))
                    .Select(x => x.PelletId)
                    .ToListAsync();
                var existingDrafts = await _context.FormDraftEntries
                    .Where(x => x.ModuleKey == "RAW_PELLETS" && x.EntryId.StartsWith(pattern))
                    .Select(x => x.EntryId)
                    .ToListAsync();
                maxSerial = existing.Concat(existingDrafts).Select(id => int.TryParse(id.Substring(pattern.Length), out var num) ? num : 0).DefaultIfEmpty(0).Max();
            }
            else if (material?.ToUpper() == "IRON_ORE")
            {
                await EnsureFormDraftTableAsync();
                var existing = await _context.IronOreEntries
                    .Where(x => x.IronOreId.StartsWith(pattern))
                    .Select(x => x.IronOreId)
                    .ToListAsync();
                var existingDrafts = await _context.FormDraftEntries
                    .Where(x => x.ModuleKey == "RAW_IRON_ORE" && x.EntryId.StartsWith(pattern))
                    .Select(x => x.EntryId)
                    .ToListAsync();
                maxSerial = existing.Concat(existingDrafts).Select(id => int.TryParse(id.Substring(pattern.Length), out var num) ? num : 0).DefaultIfEmpty(0).Max();
            }
            else if (material?.ToUpper() == "DOLOMITE")
            {
                await EnsureFormDraftTableAsync();
                var existing = await _context.DolomiteEntries
                    .Where(x => x.DolomiteId.StartsWith(pattern))
                    .Select(x => x.DolomiteId)
                    .ToListAsync();
                var existingDrafts = await _context.FormDraftEntries
                    .Where(x => x.ModuleKey == "RAW_DOLOMITE" && x.EntryId.StartsWith(pattern))
                    .Select(x => x.EntryId)
                    .ToListAsync();
                maxSerial = existing.Concat(existingDrafts).Select(id => int.TryParse(id.Substring(pattern.Length), out var num) ? num : 0).DefaultIfEmpty(0).Max();
            }

            var nextSerial = (maxSerial + 1).ToString("D2");
            return Ok($"{pattern}{nextSerial}");
        }

        [HttpGet("stock-belt-options")]
        public IActionResult GetStockBeltOptions()
        {
            return Ok(new[] { "Belt 1", "Belt 2", "Belt 3", "Belt 4" });
        }
        [HttpPost("upload-coal-image")]
        public Task<IActionResult> UploadCoalImage([FromForm] IFormFile? file)
            => SaveRawMaterialImage(file, "coal");

        [HttpPost("upload-pellets-image")]
        public Task<IActionResult> UploadPelletsImage([FromForm] IFormFile? file)
            => SaveRawMaterialImage(file, "pellets");

        [HttpPost("upload-ironore-image")]
        public Task<IActionResult> UploadIronOreImage([FromForm] IFormFile? file)
            => SaveRawMaterialImage(file, "ironore");

        [HttpPost("upload-dolomite-image")]
        public Task<IActionResult> UploadDolomiteImage([FromForm] IFormFile? file)
            => SaveRawMaterialImage(file, "dolomite");

        private async Task<IActionResult> SaveRawMaterialImage(IFormFile? file, string materialFolder)
        {
            try
            {
                if (file == null || file.Length == 0)
                    return BadRequest(new { message = "No file selected" });

                var ext = Path.GetExtension(file.FileName);
                var allowed = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
                {
                    ".jpg", ".jpeg", ".png", ".webp", ".bmp"
                };

                if (string.IsNullOrWhiteSpace(ext) || !allowed.Contains(ext))
                    return BadRequest(new { message = "Only image files are allowed" });

                var uploadsRoot = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", materialFolder);
                Directory.CreateDirectory(uploadsRoot);

                var fileName = $"{materialFolder}_{DateTime.Now:yyyyMMddHHmmssfff}_{Guid.NewGuid():N}{ext}";
                var fullPath = Path.Combine(uploadsRoot, fileName);

                await using (var stream = new FileStream(fullPath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                var relativePath = $"/uploads/{materialFolder}/{fileName}";
                return Ok(new { path = relativePath, imagePath = relativePath, url = relativePath, fileName });
            }
            catch (Exception)
            {
                throw;
            }
        }

        [HttpPost("save-coal")]
        public async Task<IActionResult> SaveCoal([FromBody] RawMaterialCoal data)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(data.CoalId))
                {
                    return BadRequest(new { message = "Coal ID is required" });
                }

                if (string.IsNullOrWhiteSpace(data.Status) ||
                    string.Equals(data.Status, "DRAFT", StringComparison.OrdinalIgnoreCase))
                {
                    data.Status = "Pending";
                }

                var existing = await _context.CoalEntries.FindAsync(data.CoalId);
                if (existing == null)
                {
                    _context.CoalEntries.Add(data);
                }
                else
                {
                    _context.Entry(existing).CurrentValues.SetValues(data);
                }
                await _context.SaveChangesAsync();

                await EnsureCoalDraftTableAsync();
                var existingDraft = await _context.CoalDraftEntries.FindAsync(data.CoalId);
                if (existingDraft != null)
                {
                    _context.CoalDraftEntries.Remove(existingDraft);
                    await _context.SaveChangesAsync();
                }

                SapLimsPostResponseDto? sapResponse = null;
                string? sapError = null;

                try
                {
                    sapResponse = await _sapPythonService.PostCoalLabResultsAsync(data, HttpContext.RequestAborted);
                }
                catch (ApiException sapEx)
                {
                    _logger.LogWarning(sapEx, "SAP synchronization failed after saving coal record {CoalId}.", data.CoalId);
                    sapError = sapEx.UserMessage;
                }
                catch (Exception sapEx)
                {
                    _logger.LogError(sapEx, "Unexpected SAP synchronization failure after saving coal record {CoalId}.", data.CoalId);
                    sapError = "Lab results were saved locally, but SAP synchronization is currently unavailable.";
                }

                var sapUpdated = sapResponse?.Success == true &&
                                 sapResponse.ResultsPosted &&
                                 sapResponse.UsageDecisionPosted;

                return Ok(new
                {
                    id = data.CoalId,
                    dbSaved = true,
                    sapAttempted = true,
                    sapUpdated,
                    sapMessage = sapResponse?.Message ?? sapError,
                    sapResponse,
                });
            }
            catch (Exception)
            {
                throw;
            }
        }

        [HttpPost("save-coal-draft")]
        public async Task<IActionResult> SaveCoalDraft([FromBody] RawMaterialCoalDraft data)
        {
            try
            {
                await EnsureCoalDraftTableAsync();

                if (string.IsNullOrWhiteSpace(data.CoalId))
                {
                    return BadRequest(new { message = "Coal ID is required" });
                }

                data.Status = "DRAFT";
                data.LastSavedAt = DateTime.UtcNow;

                var existing = await _context.CoalDraftEntries.FindAsync(data.CoalId);
                if (existing == null)
                {
                    _context.CoalDraftEntries.Add(data);
                }
                else
                {
                    _context.Entry(existing).CurrentValues.SetValues(data);
                }

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    id = data.CoalId,
                    draftSaved = true,
                    status = data.Status,
                    lastSavedAt = data.LastSavedAt,
                });
            }
            catch (Exception)
            {
                throw;
            }
        }

        [HttpGet("get-coal-draft/{entryId}")]
        public async Task<IActionResult> GetCoalDraft(string entryId)
        {
            try
            {
                await EnsureCoalDraftTableAsync();

                if (string.IsNullOrWhiteSpace(entryId))
                {
                    return BadRequest(new { message = "Coal ID is required" });
                }

                var draft = await _context.CoalDraftEntries
                    .AsNoTracking()
                    .FirstOrDefaultAsync(x => x.CoalId == entryId);

                if (draft == null)
                {
                    return NotFound(new { message = "Draft not found" });
                }

                return Ok(draft);
            }
            catch (Exception)
            {
                throw;
            }
        }

        [HttpGet("get-coal-drafts")]
        public async Task<IActionResult> GetCoalDrafts([FromQuery] string? userId = null)
        {
            try
            {
                await EnsureCoalDraftTableAsync();

                var normalizedUserId = string.IsNullOrWhiteSpace(userId)
                    ? null
                    : userId.Trim();

                var query = _context.CoalDraftEntries
                    .AsNoTracking()
                    .AsQueryable();

                if (!string.IsNullOrWhiteSpace(normalizedUserId))
                {
                    query = query.Where(x => x.FilledBy == normalizedUserId);
                }

                var drafts = await query
                    .OrderByDescending(x => x.LastSavedAt)
                    .ThenByDescending(x => x.EntryDate)
                    .ToListAsync();

                return Ok(drafts);
            }
            catch (Exception)
            {
                throw;
            }
        }

        [HttpPost("save-form-draft")]
        public async Task<IActionResult> SaveFormDraft([FromBody] AppFormDraft data)
        {
            try
            {
                await EnsureFormDraftTableAsync();

                if (string.IsNullOrWhiteSpace(data.ModuleKey) || string.IsNullOrWhiteSpace(data.EntryId))
                {
                    return BadRequest(new { message = "Module key and Entry ID are required" });
                }

                data.DraftKey = BuildFormDraftKey(data.ModuleKey, data.EntryId);
                data.Status = "DRAFT";
                data.LastSavedAt = DateTime.UtcNow;

                var existing = await _context.FormDraftEntries.FindAsync(data.DraftKey);
                if (existing == null)
                {
                    _context.FormDraftEntries.Add(data);
                }
                else
                {
                    _context.Entry(existing).CurrentValues.SetValues(data);
                }

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    id = data.EntryId,
                    moduleKey = data.ModuleKey,
                    draftSaved = true,
                    status = data.Status,
                    lastSavedAt = data.LastSavedAt,
                });
            }
            catch (Exception)
            {
                throw;
            }
        }

        [HttpGet("get-form-drafts")]
        public async Task<IActionResult> GetFormDrafts([FromQuery] string moduleKey, [FromQuery] string? userId = null)
        {
            try
            {
                await EnsureFormDraftTableAsync();

                if (string.IsNullOrWhiteSpace(moduleKey))
                {
                    return BadRequest(new { message = "Module key is required" });
                }

                var normalizedModuleKey = moduleKey.Trim();
                var normalizedUserId = string.IsNullOrWhiteSpace(userId) ? null : userId.Trim();

                var query = _context.FormDraftEntries
                    .AsNoTracking()
                    .Where(x => x.ModuleKey == normalizedModuleKey);

                if (!string.IsNullOrWhiteSpace(normalizedUserId))
                {
                    query = query.Where(x => x.FilledBy == normalizedUserId);
                }

                var drafts = await query
                    .OrderByDescending(x => x.LastSavedAt)
                    .ToListAsync();

                return Ok(drafts);
            }
            catch (Exception)
            {
                throw;
            }
        }

        [HttpGet("get-form-draft")]
        public async Task<IActionResult> GetFormDraft([FromQuery] string moduleKey, [FromQuery] string entryId)
        {
            try
            {
                await EnsureFormDraftTableAsync();

                if (string.IsNullOrWhiteSpace(moduleKey) || string.IsNullOrWhiteSpace(entryId))
                {
                    return BadRequest(new { message = "Module key and Entry ID are required" });
                }

                var draftKey = BuildFormDraftKey(moduleKey, entryId);
                var draft = await _context.FormDraftEntries
                    .AsNoTracking()
                    .FirstOrDefaultAsync(x => x.DraftKey == draftKey);

                if (draft == null)
                {
                    return NotFound(new { message = "Draft not found" });
                }

                return Ok(draft);
            }
            catch (Exception)
            {
                throw;
            }
        }

        [HttpPost("save-pellets")]
        public async Task<IActionResult> SavePellets([FromBody] RawMaterialPellets data)
        {
            try
            {
                var existing = await _context.PelletEntries.FindAsync(data.PelletId);
                if (existing == null)
                {
                    _context.PelletEntries.Add(data);
                }
                else
                {
                    _context.Entry(existing).CurrentValues.SetValues(data);
                }
                await _context.SaveChangesAsync();
                await DeleteFormDraftAsync("RAW_PELLETS", data.PelletId);
                return Ok(new { id = data.PelletId });
            }
            catch (Exception)
            {
                throw;
            }
        }

        [HttpPost("save-iron-ore")]
        public async Task<IActionResult> SaveIronOre([FromBody] RawMaterialIronOre data)
        {
            try
            {
                var existing = await _context.IronOreEntries.FindAsync(data.IronOreId);
                if (existing == null)
                {
                    _context.IronOreEntries.Add(data);
                }
                else
                {
                    _context.Entry(existing).CurrentValues.SetValues(data);
                }
                await _context.SaveChangesAsync();
                await DeleteFormDraftAsync("RAW_IRON_ORE", data.IronOreId);
                return Ok(new { id = data.IronOreId });
            }
            catch (Exception)
            {
                throw;
            }
        }

        [HttpPost("save-dolomite")]
        public async Task<IActionResult> SaveDolomite([FromBody] RawMaterialDolomite data)
        {
            try
            {
                var existing = await _context.DolomiteEntries.FindAsync(data.DolomiteId);
                if (existing == null)
                {
                    _context.DolomiteEntries.Add(data);
                }
                else
                {
                    _context.Entry(existing).CurrentValues.SetValues(data);
                }
                await _context.SaveChangesAsync();
                await DeleteFormDraftAsync("RAW_DOLOMITE", data.DolomiteId);
                return Ok(new { id = data.DolomiteId });
            }
            catch (Exception)
            {
                throw;
            }
        }


        [HttpGet("get-next-stock-id")]
        public async Task<IActionResult> GetNextStockId([FromQuery] string material)
        {
            var prefix = material switch
            {
                "Coal" => "STC",
                "IronOre" => "STI",
                "Dolomite" => "STD",
                "Charcoal" => "STCH",
                _ => "ST"
            };
            var now = DateTime.Now;
            var datePrefix = $"{now:MMddyy}{now:HH}";
            var pattern = $"{prefix}{datePrefix}";

            int maxSerial = 0;
            if (material == "Coal")
            {
                await EnsureFormDraftTableAsync();
                var existing = await _context.StockHouseCoal
                    .Where(x => x.Id != null && x.Id.StartsWith(pattern))
                    .Select(x => x.Id!)
                    .ToListAsync();
                var existingDrafts = await _context.FormDraftEntries
                    .Where(x => x.ModuleKey == "STOCK_COAL" && x.EntryId.StartsWith(pattern))
                    .Select(x => x.EntryId)
                    .ToListAsync();
                maxSerial = existing.Concat(existingDrafts).Select(id => int.TryParse(id.Substring(pattern.Length), out var num) ? num : 0).DefaultIfEmpty(0).Max();
            }
            else if (material == "IronOre")
            {
                await EnsureFormDraftTableAsync();
                var existing = await _context.StockHouseIronOre
                    .Where(x => x.Id != null && x.Id.StartsWith(pattern))
                    .Select(x => x.Id!)
                    .ToListAsync();
                var existingDrafts = await _context.FormDraftEntries
                    .Where(x => x.ModuleKey == "STOCK_IRON_ORE" && x.EntryId.StartsWith(pattern))
                    .Select(x => x.EntryId)
                    .ToListAsync();
                maxSerial = existing.Concat(existingDrafts).Select(id => int.TryParse(id.Substring(pattern.Length), out var num) ? num : 0).DefaultIfEmpty(0).Max();
            }
            else if (material == "Dolomite")
            {
                await EnsureFormDraftTableAsync();
                var existing = await _context.StockHouseDolomite
                    .Where(x => x.Id != null && x.Id.StartsWith(pattern))
                    .Select(x => x.Id!)
                    .ToListAsync();
                var existingDrafts = await _context.FormDraftEntries
                    .Where(x => x.ModuleKey == "STOCK_DOLOMITE" && x.EntryId.StartsWith(pattern))
                    .Select(x => x.EntryId)
                    .ToListAsync();
                maxSerial = existing.Concat(existingDrafts).Select(id => int.TryParse(id.Substring(pattern.Length), out var num) ? num : 0).DefaultIfEmpty(0).Max();
            }
            else if (material == "Charcoal")
            {
                await EnsureFormDraftTableAsync();
                var existing = await _context.StockHouseCharcoal
                    .Where(x => x.Id != null && x.Id.StartsWith(pattern))
                    .Select(x => x.Id!)
                    .ToListAsync();
                var existingDrafts = await _context.FormDraftEntries
                    .Where(x => x.ModuleKey == "STOCK_CHARCOAL" && x.EntryId.StartsWith(pattern))
                    .Select(x => x.EntryId)
                    .ToListAsync();
                maxSerial = existing.Concat(existingDrafts).Select(id => int.TryParse(id.Substring(pattern.Length), out var num) ? num : 0).DefaultIfEmpty(0).Max();
            }

            var nextSerial = (maxSerial + 1).ToString("D2");
            return Ok($"{pattern}{nextSerial}");
        }

        [HttpPost("save-stock-coal")]
        public async Task<IActionResult> SaveStockCoal([FromBody] StockHouseCoal data)
        {
            try
            {
                var existing = await _context.StockHouseCoal.FindAsync(data.Id);
                if (existing == null)
                {
                    _context.StockHouseCoal.Add(data);
                }
                else
                {
                    _context.Entry(existing).CurrentValues.SetValues(data);
                }
                await _context.SaveChangesAsync();
                await DeleteFormDraftAsync("STOCK_COAL", data.Id ?? "");
                return Ok(data.Id);
            }
            catch (Exception)
            {
                throw;
            }
        }

        [HttpPost("save-stock-ironore")]
        public async Task<IActionResult> SaveStockIronOre([FromBody] StockHouseIronOre data)
        {
            try
            {
                var existing = await _context.StockHouseIronOre.FindAsync(data.Id);
                if (existing == null)
                {
                    _context.StockHouseIronOre.Add(data);
                }
                else
                {
                    _context.Entry(existing).CurrentValues.SetValues(data);
                }
                await _context.SaveChangesAsync();
                await DeleteFormDraftAsync("STOCK_IRON_ORE", data.Id ?? "");
                return Ok(data.Id);
            }
            catch (Exception)
            {
                throw;
            }
        }

        [HttpPost("save-stock-dolomite")]
        public async Task<IActionResult> SaveStockDolomite([FromBody] StockHouseDolomite data)
        {
            try
            {
                var existing = await _context.StockHouseDolomite.FindAsync(data.Id);
                if (existing == null)
                {
                    _context.StockHouseDolomite.Add(data);
                }
                else
                {
                    _context.Entry(existing).CurrentValues.SetValues(data);
                }
                await _context.SaveChangesAsync();
                await DeleteFormDraftAsync("STOCK_DOLOMITE", data.Id ?? "");
                return Ok(data.Id);
            }
            catch (Exception)
            {
                throw;
            }
        }

        [HttpPost("save-stock-charcoal")]
        public async Task<IActionResult> SaveStockCharcoal([FromBody] StockHouseCharcoal data)
        {
            try
            {
                var existing = await _context.StockHouseCharcoal.FindAsync(data.Id);
                if (existing == null)
                {
                    _context.StockHouseCharcoal.Add(data);
                }
                else
                {
                    _context.Entry(existing).CurrentValues.SetValues(data);
                }
                await _context.SaveChangesAsync();
                await DeleteFormDraftAsync("STOCK_CHARCOAL", data.Id ?? "");
                return Ok(data.Id);
            }
            catch (Exception)
            {
                throw;
            }
        }

        [HttpGet("get-next-production-id")]
        public async Task<IActionResult> GetNextProductionId([FromQuery] string source)
        {
            var prefix = source?.ToUpper() == "CD" ? "CD" : "PH";
            var now = DateTime.Now;
            var datePrefix = $"{now:MMddyy}{now:HH}";
            var pattern = $"{prefix}{datePrefix}";

            var existing = await _context.ProductionEntries
                .Where(x => x.ProductionCode != null && x.ProductionCode.StartsWith(pattern))
                .Select(x => x.ProductionCode!)
                .ToListAsync();
            await EnsureFormDraftTableAsync();
            var existingDrafts = await _context.FormDraftEntries
                .Where(x => x.ModuleKey == $"PRODUCTION_{prefix}" && x.EntryId.StartsWith(pattern))
                .Select(x => x.EntryId)
                .ToListAsync();
            var maxSerial = existing.Concat(existingDrafts).Select(id => int.TryParse(id.Substring(pattern.Length), out var num) ? num : 0).DefaultIfEmpty(0).Max();

            var nextSerial = (maxSerial + 1).ToString("D2");
            return Ok($"{pattern}{nextSerial}");
        }

        [HttpPost("save-production")]
        public async Task<IActionResult> SaveProduction([FromBody] ProductionEntry data)
        {
            try
            {
                ProductionEntry? existing = null;

                if (data.Id > 0)
                {
                    existing = await _context.ProductionEntries.FindAsync(data.Id);
                }

                if (existing == null && !string.IsNullOrWhiteSpace(data.ProductionCode))
                {
                    existing = await _context.ProductionEntries
                        .FirstOrDefaultAsync(x => x.ProductionCode == data.ProductionCode);
                }

                if (existing == null)
                {
                    _context.ProductionEntries.Add(data);
                }
                else
                {
                    var keepId = existing.Id;
                    _context.Entry(existing).CurrentValues.SetValues(data);
                    existing.Id = keepId;
                }

                await _context.SaveChangesAsync();
                await DeleteFormDraftAsync($"PRODUCTION_{(data.Source ?? "PH").ToUpperInvariant()}", data.ProductionCode ?? "");
                return Ok(new { id = data.ProductionCode ?? existing?.ProductionCode, dbId = existing?.Id ?? data.Id });
            }
            catch (Exception)
            {
                throw;
            }
        }

        [HttpGet("get-next-byproduct-dolochar-id")]
        public async Task<IActionResult> GetNextByProductId()
        {
            var now = DateTime.Now;
            var datePrefix = $"{now:MMddyy}{now:HH}";
            var pattern = $"BP{datePrefix}";

            var existing = await _context.ByProductDolochars
                .Where(x => x.Id != null && x.Id.StartsWith(pattern))
                .Select(x => x.Id!)
                .ToListAsync();
            var maxSerial = existing.Select(id => int.TryParse(id.Substring(pattern.Length), out var num) ? num : 0).DefaultIfEmpty(0).Max();

            var nextSerial = (maxSerial + 1).ToString("D2");
            return Ok($"{pattern}{nextSerial}");
        }

        [HttpPost("save-byproduct-dolochar")]
        public async Task<IActionResult> SaveByProduct([FromBody] ByProductDolochar data)
        {
            try
            {
                var existing = await _context.ByProductDolochars.FindAsync(data.Id);
                if (existing == null)
                {
                    _context.ByProductDolochars.Add(data);
                }
                else
                {
                    _context.Entry(existing).CurrentValues.SetValues(data);
                }
                await _context.SaveChangesAsync();
                return Ok(new { id = data.Id });
            }
            catch (Exception)
            {
                throw;
            }
        }

        [HttpGet("get-next-dispatch-id")]
        public async Task<IActionResult> GetNextDispatchId()
        {
            var now = DateTime.Now;
            var datePrefix = $"{now:MMddyy}{now:HH}";
            var pattern = $"DSP{datePrefix}";

            var existing = await _context.DispatchEntries
                .Where(x => x.Id != null && x.Id.StartsWith(pattern))
                .Select(x => x.Id!)
                .ToListAsync();
            await EnsureFormDraftTableAsync();
            var existingDrafts = await _context.FormDraftEntries
                .Where(x => x.ModuleKey == "DISPATCH" && x.EntryId.StartsWith(pattern))
                .Select(x => x.EntryId)
                .ToListAsync();
            var maxSerial = existing.Concat(existingDrafts).Select(id => int.TryParse(id.Substring(pattern.Length), out var num) ? num : 0).DefaultIfEmpty(0).Max();

            var nextSerial = (maxSerial + 1).ToString("D2");
            return Ok($"{pattern}{nextSerial}");
        }

        [HttpPost("save-dispatch")]
        public async Task<IActionResult> SaveDispatch([FromBody] DispatchEntry data)
        {
            try
            {
                var existing = await _context.DispatchEntries.FindAsync(data.Id);
                if (existing == null)
                {
                    _context.DispatchEntries.Add(data);
                }
                else
                {
                    _context.Entry(existing).CurrentValues.SetValues(data);
                }
                await _context.SaveChangesAsync();
                await DeleteFormDraftAsync("DISPATCH", data.Id ?? "");
                return Ok(new { id = data.Id });
            }
            catch (Exception)
            {
                throw;
            }
        }

        [HttpGet("reports-options")]
        public IActionResult GetReportsOptions()
        {
            return Ok(new
            {
                dates = new List<string>(),
                testings = new[] { "Raw Material", "Stock House", "Production", "Dispatch" },
                materials = new[] { "Coal", "Pellets", "Iron Ore", "Dolomite", "Charcoal", "Cooler Discharge", "Product House", "Dolochar" }
            });
        }

        [HttpPost("reports-filter")]
        public async Task<IActionResult> GetReportsFilter([FromBody] ReportsFilterRequest request)
        {
            try
            {
                DateTime? fromDate = null;
                DateTime? toDate = null;

                if (!string.IsNullOrEmpty(request.DateFrom) && DateTime.TryParse(request.DateFrom, out var parsedFrom))
                {
                    fromDate = parsedFrom.Date;
                }
                if (!string.IsNullOrEmpty(request.DateTo) && DateTime.TryParse(request.DateTo, out var parsedTo))
                {
                    toDate = parsedTo.Date.AddDays(1).AddSeconds(-1);
                }

                var coalQuery = _context.CoalEntries.AsQueryable();
                var pelletsQuery = _context.PelletEntries.AsQueryable();
                var ironOreQuery = _context.IronOreEntries.AsQueryable();
                var dolomiteQuery = _context.DolomiteEntries.AsQueryable();
                var productionQuery = _context.ProductionEntries.AsQueryable();
                var dispatchQuery = _context.DispatchEntries.AsQueryable();
                var stockCoalQuery = _context.StockHouseCoal.AsQueryable();
                var stockIronOreQuery = _context.StockHouseIronOre.AsQueryable();
                var stockDolomiteQuery = _context.StockHouseDolomite.AsQueryable();
                var stockCharcoalQuery = _context.StockHouseCharcoal.AsQueryable();
                var byProductQuery = _context.ByProductDolochars.AsQueryable();

                if (fromDate.HasValue)
                {
                    coalQuery = coalQuery.Where(x => x.EntryDate >= fromDate.Value);
                    pelletsQuery = pelletsQuery.Where(x => x.EntryDate >= fromDate.Value);
                    ironOreQuery = ironOreQuery.Where(x => x.EntryDate >= fromDate.Value);
                    dolomiteQuery = dolomiteQuery.Where(x => x.EntryDate >= fromDate.Value);
                    productionQuery = productionQuery.Where(x => x.EntryDate >= fromDate.Value);
                    dispatchQuery = dispatchQuery.Where(x => x.EntryDate >= fromDate.Value);
                    stockCoalQuery = stockCoalQuery.Where(x => x.EntryDate >= fromDate.Value);
                    stockIronOreQuery = stockIronOreQuery.Where(x => x.EntryDate >= fromDate.Value);
                    stockDolomiteQuery = stockDolomiteQuery.Where(x => x.EntryDate >= fromDate.Value);
                    stockCharcoalQuery = stockCharcoalQuery.Where(x => x.EntryDate >= fromDate.Value);
                    byProductQuery = byProductQuery.Where(x => x.EntryDate >= fromDate.Value);
                }

                if (toDate.HasValue)
                {
                    coalQuery = coalQuery.Where(x => x.EntryDate <= toDate.Value);
                    pelletsQuery = pelletsQuery.Where(x => x.EntryDate <= toDate.Value);
                    ironOreQuery = ironOreQuery.Where(x => x.EntryDate <= toDate.Value);
                    dolomiteQuery = dolomiteQuery.Where(x => x.EntryDate <= toDate.Value);
                    productionQuery = productionQuery.Where(x => x.EntryDate <= toDate.Value);
                    dispatchQuery = dispatchQuery.Where(x => x.EntryDate <= toDate.Value);
                    stockCoalQuery = stockCoalQuery.Where(x => x.EntryDate <= toDate.Value);
                    stockIronOreQuery = stockIronOreQuery.Where(x => x.EntryDate <= toDate.Value);
                    stockDolomiteQuery = stockDolomiteQuery.Where(x => x.EntryDate <= toDate.Value);
                    stockCharcoalQuery = stockCharcoalQuery.Where(x => x.EntryDate <= toDate.Value);
                    byProductQuery = byProductQuery.Where(x => x.EntryDate <= toDate.Value);
                }

                var coal = await coalQuery.ToListAsync();
                var pellets = await pelletsQuery.ToListAsync();
                var ironOre = await ironOreQuery.ToListAsync();
                var dolomite = await dolomiteQuery.ToListAsync();
                var production = await productionQuery.ToListAsync();
                var dispatch = await dispatchQuery.ToListAsync();
                var stockCoal = await stockCoalQuery.ToListAsync();
                var stockIronOre = await stockIronOreQuery.ToListAsync();
                var stockDolomite = await stockDolomiteQuery.ToListAsync();
                var stockCharcoal = await stockCharcoalQuery.ToListAsync();
                var byProduct = await byProductQuery.ToListAsync();

                return Ok(new
                {
                    coal,
                    pellets,
                    ironOre,
                    dolomite,
                    production,
                    dispatch,
                    stockCoal,
                    stockIronOre,
                    stockDolomite,
                    stockCharcoal,
                    byProductDolochar = byProduct
                });
            }
            catch (Exception)
            {
                throw;
            }
        }

        [HttpPost("reports-export")]
        public async Task<IActionResult> ExportReportsExcel([FromBody] ReportsFilterRequest request)
        {
            try
            {
                DateTime? fromDate = null;
                DateTime? toDate = null;

                if (!string.IsNullOrEmpty(request.DateFrom) && DateTime.TryParse(request.DateFrom, out var parsedFrom))
                {
                    fromDate = parsedFrom.Date;
                }
                if (!string.IsNullOrEmpty(request.DateTo) && DateTime.TryParse(request.DateTo, out var parsedTo))
                {
                    toDate = parsedTo.Date.AddDays(1).AddSeconds(-1);
                }

                var coalQuery = _context.CoalEntries.AsQueryable();
                var pelletsQuery = _context.PelletEntries.AsQueryable();
                var dispatchQuery = _context.DispatchEntries.AsQueryable();

                if (fromDate.HasValue)
                {
                    coalQuery = coalQuery.Where(x => x.EntryDate >= fromDate.Value);
                    pelletsQuery = pelletsQuery.Where(x => x.EntryDate >= fromDate.Value);
                    dispatchQuery = dispatchQuery.Where(x => x.EntryDate >= fromDate.Value);
                }

                if (toDate.HasValue)
                {
                    coalQuery = coalQuery.Where(x => x.EntryDate <= toDate.Value);
                    pelletsQuery = pelletsQuery.Where(x => x.EntryDate <= toDate.Value);
                    dispatchQuery = dispatchQuery.Where(x => x.EntryDate <= toDate.Value);
                }

                var coal = await coalQuery.ToListAsync();
                var pellets = await pelletsQuery.ToListAsync();
                var dispatch = await dispatchQuery.ToListAsync();

                // Create CSV content instead of Excel
                var csv = new System.Text.StringBuilder();

                if (coal.Any())
                {
                    csv.AppendLine("Raw Material Coal");
                    csv.AppendLine("Coal ID,Month,Entry Date,Party,TM,VM,ASH,Status");
                    foreach (var item in coal)
                    {
                        csv.AppendLine($"{item.CoalId},{item.MonthName},{item.EntryDate:yyyy-MM-dd},{item.Party},{item.Tm},{item.Vm},{item.Ash},{item.Status}");
                    }
                    csv.AppendLine();
                }

                if (pellets.Any())
                {
                    csv.AppendLine("Raw Material Pellets");
                    csv.AppendLine("Pellet ID,Month,Supplier,Fe(T),LOI,Status");
                    foreach (var item in pellets)
                    {
                        csv.AppendLine($"{item.PelletId},{item.MonthName},{item.Supplier},{item.FeTPct},{item.loipct},{item.Status}");
                    }
                    csv.AppendLine();
                }

                if (dispatch.Any())
                {
                    csv.AppendLine("Dispatch");
                    csv.AppendLine("ID,Month,Party Name,Destination,QTY,Status");
                    foreach (var item in dispatch)
                    {
                        csv.AppendLine($"{item.Id},{item.Month},{item.PartyName},{item.Destination},{item.Qty},{item.Status}");
                    }
                }

                var csvBytes = System.Text.Encoding.UTF8.GetBytes(csv.ToString());
                return File(csvBytes, "text/csv", "reports.csv");
            }
            catch (Exception)
            {
                throw;
            }
        }

        [HttpPost("reports-export-pdf")]
        public async Task<IActionResult> ExportReportsPdf([FromBody] ReportsFilterRequest request)
        {
            try
            {
                QuestPDF.Settings.License = LicenseType.Community;

                DateTime? fromDate = null;
                DateTime? toDate = null;

                if (!string.IsNullOrEmpty(request.DateFrom) && DateTime.TryParse(request.DateFrom, out var parsedFrom))
                {
                    fromDate = parsedFrom.Date;
                }
                if (!string.IsNullOrEmpty(request.DateTo) && DateTime.TryParse(request.DateTo, out var parsedTo))
                {
                    toDate = parsedTo.Date.AddDays(1).AddSeconds(-1);
                }

                var coalQuery = _context.CoalEntries.AsQueryable();
                var pelletsQuery = _context.PelletEntries.AsQueryable();
                var ironOreQuery = _context.IronOreEntries.AsQueryable();
                var dolomiteQuery = _context.DolomiteEntries.AsQueryable();
                var productionQuery = _context.ProductionEntries.AsQueryable();
                var dispatchQuery = _context.DispatchEntries.AsQueryable();
                var stockCoalQuery = _context.StockHouseCoal.AsQueryable();
                var stockIronOreQuery = _context.StockHouseIronOre.AsQueryable();
                var stockDolomiteQuery = _context.StockHouseDolomite.AsQueryable();
                var stockCharcoalQuery = _context.StockHouseCharcoal.AsQueryable();
                var byProductQuery = _context.ByProductDolochars.AsQueryable();

                if (fromDate.HasValue)
                {
                    coalQuery = coalQuery.Where(x => x.EntryDate >= fromDate.Value);
                    pelletsQuery = pelletsQuery.Where(x => x.EntryDate >= fromDate.Value);
                    ironOreQuery = ironOreQuery.Where(x => x.EntryDate >= fromDate.Value);
                    dolomiteQuery = dolomiteQuery.Where(x => x.EntryDate >= fromDate.Value);
                    productionQuery = productionQuery.Where(x => x.EntryDate >= fromDate.Value);
                    dispatchQuery = dispatchQuery.Where(x => x.EntryDate >= fromDate.Value);
                    stockCoalQuery = stockCoalQuery.Where(x => x.EntryDate >= fromDate.Value);
                    stockIronOreQuery = stockIronOreQuery.Where(x => x.EntryDate >= fromDate.Value);
                    stockDolomiteQuery = stockDolomiteQuery.Where(x => x.EntryDate >= fromDate.Value);
                    stockCharcoalQuery = stockCharcoalQuery.Where(x => x.EntryDate >= fromDate.Value);
                    byProductQuery = byProductQuery.Where(x => x.EntryDate >= fromDate.Value);
                }

                if (toDate.HasValue)
                {
                    coalQuery = coalQuery.Where(x => x.EntryDate <= toDate.Value);
                    pelletsQuery = pelletsQuery.Where(x => x.EntryDate <= toDate.Value);
                    ironOreQuery = ironOreQuery.Where(x => x.EntryDate <= toDate.Value);
                    dolomiteQuery = dolomiteQuery.Where(x => x.EntryDate <= toDate.Value);
                    productionQuery = productionQuery.Where(x => x.EntryDate <= toDate.Value);
                    dispatchQuery = dispatchQuery.Where(x => x.EntryDate <= toDate.Value);
                    stockCoalQuery = stockCoalQuery.Where(x => x.EntryDate <= toDate.Value);
                    stockIronOreQuery = stockIronOreQuery.Where(x => x.EntryDate <= toDate.Value);
                    stockDolomiteQuery = stockDolomiteQuery.Where(x => x.EntryDate <= toDate.Value);
                    stockCharcoalQuery = stockCharcoalQuery.Where(x => x.EntryDate <= toDate.Value);
                    byProductQuery = byProductQuery.Where(x => x.EntryDate <= toDate.Value);
                }

                var coal = await coalQuery.ToListAsync();
                var pellets = await pelletsQuery.ToListAsync();
                var ironOre = await ironOreQuery.ToListAsync();
                var dolomite = await dolomiteQuery.ToListAsync();
                var production = await productionQuery.ToListAsync();
                var dispatch = await dispatchQuery.ToListAsync();
                var stockCoal = await stockCoalQuery.ToListAsync();
                var stockIronOre = await stockIronOreQuery.ToListAsync();
                var stockDolomite = await stockDolomiteQuery.ToListAsync();
                var stockCharcoal = await stockCharcoalQuery.ToListAsync();
                var byProduct = await byProductQuery.ToListAsync();

                var selectedTestings = request.Testings ?? new List<string>();
                var selectedMaterials = request.Materials ?? new List<string>();

                var showAllTestings = selectedTestings.Count == 0 || selectedTestings.Contains("All");
                var showAllMaterials = selectedMaterials.Count == 0 || selectedMaterials.Contains("All");

                var showRawMaterial = showAllTestings || selectedTestings.Contains("Raw Material");
                var showStockHouse = showAllTestings || selectedTestings.Contains("Stock House");
                var showProduction = showAllTestings || selectedTestings.Contains("Production");
                var showDispatch = showAllTestings || selectedTestings.Contains("Dispatch");

                var showRawCoal = showRawMaterial && (showAllMaterials || selectedMaterials.Contains("Coal"));
                var showRawPellets = showRawMaterial && (showAllMaterials || selectedMaterials.Contains("Pellets"));
                var showRawIron = showRawMaterial && (showAllMaterials || selectedMaterials.Contains("Iron Ore"));
                var showRawDolomite = showRawMaterial && (showAllMaterials || selectedMaterials.Contains("Dolomite"));

                var showStockCoal = showStockHouse && (showAllMaterials || selectedMaterials.Contains("Coal"));
                var showStockIron = showStockHouse && (showAllMaterials || selectedMaterials.Contains("Iron Ore"));
                var showStockDolomite = showStockHouse && (showAllMaterials || selectedMaterials.Contains("Dolomite"));
                var showStockCharcoal = showStockHouse && (showAllMaterials || selectedMaterials.Contains("Charcoal"));

                var showProductionData = showProduction && (showAllMaterials || selectedMaterials.Contains("Cooler Discharge") || selectedMaterials.Contains("Product House"));
                var showByProductDolochar = showProduction && (showAllMaterials || selectedMaterials.Contains("Dolochar"));
                var showDispatchData = showDispatch && (showAllMaterials || selectedMaterials.Contains("Coal") || selectedMaterials.Contains("Pellets") || selectedMaterials.Contains("Iron Ore") || selectedMaterials.Contains("Dolomite") || selectedMaterials.Contains("Charcoal"));

                var pdfBytes = Document.Create(container =>
                {
                    container.Page(page =>
                    {
                        page.Size(PageSizes.A4.Landscape());
                        page.Margin(15);
                        page.DefaultTextStyle(x => x.FontSize(7));

                        page.Header().Text("Reports Dashboard").FontSize(16).Bold();

                        page.Content().Column(column =>
                        {
                            var hasRenderedSection = false;

                            column.Item().Text($"Generated: {DateTime.Now:yyyy-MM-dd HH:mm}").FontSize(7);
                            column.Item().PaddingVertical(3);

                            if (showRawCoal && coal.Any())
                            {
                                hasRenderedSection = true;
                                column.Item().Text($"Raw Material Coal (Total: {coal.Count})").FontSize(11).Bold();
                                column.Item().Table(table =>
                                {
                                    table.ColumnsDefinition(columns =>
                                    {
                                        columns.RelativeColumn(2);
                                        columns.RelativeColumn(1);
                                        columns.RelativeColumn(1);
                                        columns.RelativeColumn(2);
                                        columns.RelativeColumn(1);
                                        columns.RelativeColumn(1);
                                        columns.RelativeColumn(1);
                                        columns.RelativeColumn(1);
                                    });

                                    table.Header(header =>
                                    {
                                        header.Cell().Background("#1a3a5a").Padding(2).Text("Coal ID").FontColor("#ffffff").FontSize(7).Bold();
                                        header.Cell().Background("#1a3a5a").Padding(2).Text("Month").FontColor("#ffffff").FontSize(7).Bold();
                                        header.Cell().Background("#1a3a5a").Padding(2).Text("Date").FontColor("#ffffff").FontSize(7).Bold();
                                        header.Cell().Background("#1a3a5a").Padding(2).Text("Party").FontColor("#ffffff").FontSize(7).Bold();
                                        header.Cell().Background("#1a3a5a").Padding(2).Text("TM").FontColor("#ffffff").FontSize(7).Bold();
                                        header.Cell().Background("#1a3a5a").Padding(2).Text("VM").FontColor("#ffffff").FontSize(7).Bold();
                                        header.Cell().Background("#1a3a5a").Padding(2).Text("ASH").FontColor("#ffffff").FontSize(7).Bold();
                                        header.Cell().Background("#1a3a5a").Padding(2).Text("Status").FontColor("#ffffff").FontSize(7).Bold();
                                    });

                                    foreach (var item in coal.Take(50))
                                    {
                                        table.Cell().Padding(2).Text(item.CoalId ?? "-").FontSize(6);
                                        table.Cell().Padding(2).Text(item.MonthName ?? "-").FontSize(6);
                                        table.Cell().Padding(2).Text(item.EntryDate?.ToString("MM/dd") ?? "-").FontSize(6);
                                        table.Cell().Padding(2).Text(item.Party ?? "-").FontSize(6);
                                        table.Cell().Padding(2).Text(item.Tm?.ToString() ?? "-").FontSize(6);
                                        table.Cell().Padding(2).Text(item.Vm?.ToString() ?? "-").FontSize(6);
                                        table.Cell().Padding(2).Text(item.Ash?.ToString() ?? "-").FontSize(6);
                                        table.Cell().Padding(2).Text(item.Status ?? "-").FontSize(6);
                                    }
                                });
                                column.Item().PaddingVertical(5);
                            }

                            if (showRawPellets && pellets.Any())
                            {
                                hasRenderedSection = true;
                                column.Item().Text($"Raw Material Pellets (Total: {pellets.Count})").FontSize(11).Bold();
                                column.Item().Table(table =>
                                {
                                    table.ColumnsDefinition(columns =>
                                    {
                                        columns.RelativeColumn(2);
                                        columns.RelativeColumn(1);
                                        columns.RelativeColumn(2);
                                        columns.RelativeColumn(1);
                                        columns.RelativeColumn(1);
                                        columns.RelativeColumn(1);
                                    });

                                    table.Header(header =>
                                    {
                                        header.Cell().Background("#1a3a5a").Padding(2).Text("Pellet ID").FontColor("#ffffff").FontSize(7).Bold();
                                        header.Cell().Background("#1a3a5a").Padding(2).Text("Month").FontColor("#ffffff").FontSize(7).Bold();
                                        header.Cell().Background("#1a3a5a").Padding(2).Text("Supplier").FontColor("#ffffff").FontSize(7).Bold();
                                        header.Cell().Background("#1a3a5a").Padding(2).Text("Fe(T)").FontColor("#ffffff").FontSize(7).Bold();
                                        header.Cell().Background("#1a3a5a").Padding(2).Text("LOI").FontColor("#ffffff").FontSize(7).Bold();
                                        header.Cell().Background("#1a3a5a").Padding(2).Text("Status").FontColor("#ffffff").FontSize(7).Bold();
                                    });

                                    foreach (var item in pellets.Take(50))
                                    {
                                        table.Cell().Padding(2).Text(item.PelletId ?? "-").FontSize(6);
                                        table.Cell().Padding(2).Text(item.MonthName ?? "-").FontSize(6);
                                        table.Cell().Padding(2).Text(item.Supplier ?? "-").FontSize(6);
                                        table.Cell().Padding(2).Text(item.FeTPct?.ToString() ?? "-").FontSize(6);
                                        table.Cell().Padding(2).Text(item.loipct?.ToString() ?? "-").FontSize(6);
                                        table.Cell().Padding(2).Text(item.Status ?? "-").FontSize(6);
                                    }
                                });
                                column.Item().PaddingVertical(5);
                            }

                            if (showRawIron && ironOre.Any())
                            {
                                hasRenderedSection = true;
                                column.Item().Text($"Raw Material Iron Ore (Total: {ironOre.Count})").FontSize(11).Bold();
                                column.Item().Table(table =>
                                {
                                    table.ColumnsDefinition(columns =>
                                    {
                                        columns.RelativeColumn(2);
                                        columns.RelativeColumn(1);
                                        columns.RelativeColumn(2);
                                        columns.RelativeColumn(1);
                                        columns.RelativeColumn(1);
                                        columns.RelativeColumn(1);
                                        columns.RelativeColumn(1);
                                        columns.RelativeColumn(1);
                                    });

                                    table.Header(header =>
                                    {
                                        header.Cell().Background("#1a3a5a").Padding(2).Text("Iron Ore ID").FontColor("#ffffff").FontSize(7).Bold();
                                        header.Cell().Background("#1a3a5a").Padding(2).Text("Month").FontColor("#ffffff").FontSize(7).Bold();
                                        header.Cell().Background("#1a3a5a").Padding(2).Text("Supplier").FontColor("#ffffff").FontSize(7).Bold();
                                        header.Cell().Background("#1a3a5a").Padding(2).Text("Qty").FontColor("#ffffff").FontSize(7).Bold();
                                        header.Cell().Background("#1a3a5a").Padding(2).Text("Fe Total").FontColor("#ffffff").FontSize(7).Bold();
                                        header.Cell().Background("#1a3a5a").Padding(2).Text("LOI").FontColor("#ffffff").FontSize(7).Bold();
                                        header.Cell().Background("#1a3a5a").Padding(2).Text("Date").FontColor("#ffffff").FontSize(7).Bold();
                                        header.Cell().Background("#1a3a5a").Padding(2).Text("Status").FontColor("#ffffff").FontSize(7).Bold();
                                    });

                                    foreach (var item in ironOre.Take(50))
                                    {
                                        table.Cell().Padding(2).Text(item.IronOreId ?? "-").FontSize(6);
                                        table.Cell().Padding(2).Text(item.MonthName ?? "-").FontSize(6);
                                        table.Cell().Padding(2).Text(item.SupplierSource ?? "-").FontSize(6);
                                        table.Cell().Padding(2).Text(item.Qty?.ToString() ?? "-").FontSize(6);
                                        table.Cell().Padding(2).Text(item.FeTotal?.ToString() ?? "-").FontSize(6);
                                        table.Cell().Padding(2).Text(item.Loi?.ToString() ?? "-").FontSize(6);
                                        table.Cell().Padding(2).Text(item.EntryDate.ToString("MM/dd")).FontSize(6);
                                        table.Cell().Padding(2).Text(item.Status ?? "-").FontSize(6);
                                    }
                                });
                                column.Item().PaddingVertical(5);
                            }

                            if (showRawDolomite && dolomite.Any())
                            {
                                hasRenderedSection = true;
                                column.Item().Text($"Raw Material Dolomite (Total: {dolomite.Count})").FontSize(11).Bold();
                                column.Item().Table(table =>
                                {
                                    table.ColumnsDefinition(columns =>
                                    {
                                        columns.RelativeColumn(2);
                                        columns.RelativeColumn(1);
                                        columns.RelativeColumn(2);
                                        columns.RelativeColumn(1);
                                        columns.RelativeColumn(1);
                                        columns.RelativeColumn(1);
                                        columns.RelativeColumn(1);
                                    });

                                    table.Header(header =>
                                    {
                                        header.Cell().Background("#1a3a5a").Padding(2).Text("Dolomite ID").FontColor("#ffffff").FontSize(7).Bold();
                                        header.Cell().Background("#1a3a5a").Padding(2).Text("Month").FontColor("#ffffff").FontSize(7).Bold();
                                        header.Cell().Background("#1a3a5a").Padding(2).Text("Source").FontColor("#ffffff").FontSize(7).Bold();
                                        header.Cell().Background("#1a3a5a").Padding(2).Text("Qty").FontColor("#ffffff").FontSize(7).Bold();
                                        header.Cell().Background("#1a3a5a").Padding(2).Text("CaO").FontColor("#ffffff").FontSize(7).Bold();
                                        header.Cell().Background("#1a3a5a").Padding(2).Text("MgO").FontColor("#ffffff").FontSize(7).Bold();
                                        header.Cell().Background("#1a3a5a").Padding(2).Text("Status").FontColor("#ffffff").FontSize(7).Bold();
                                    });

                                    foreach (var item in dolomite.Take(50))
                                    {
                                        table.Cell().Padding(2).Text(item.DolomiteId ?? "-").FontSize(6);
                                        table.Cell().Padding(2).Text(item.MonthName ?? "-").FontSize(6);
                                        table.Cell().Padding(2).Text(item.Source ?? "-").FontSize(6);
                                        table.Cell().Padding(2).Text(item.Qty?.ToString() ?? "-").FontSize(6);
                                        table.Cell().Padding(2).Text(item.CaoPct?.ToString() ?? "-").FontSize(6);
                                        table.Cell().Padding(2).Text(item.MgoPct?.ToString() ?? "-").FontSize(6);
                                        table.Cell().Padding(2).Text(item.Status ?? "-").FontSize(6);
                                    }
                                });
                                column.Item().PaddingVertical(5);
                            }

                            if (showProductionData && production.Any())
                            {
                                hasRenderedSection = true;
                                column.Item().Text($"Production (Total: {production.Count})").FontSize(11).Bold();
                                column.Item().Table(table =>
                                {
                                    table.ColumnsDefinition(columns =>
                                    {
                                        columns.RelativeColumn(2);
                                        columns.RelativeColumn(1);
                                        columns.RelativeColumn(2);
                                        columns.RelativeColumn(1);
                                        columns.RelativeColumn(1);
                                        columns.RelativeColumn(1);
                                    });

                                    table.Header(header =>
                                    {
                                        header.Cell().Background("#1a3a5a").Padding(2).Text("Code").FontColor("#ffffff").FontSize(7).Bold();
                                        header.Cell().Background("#1a3a5a").Padding(2).Text("Source").FontColor("#ffffff").FontSize(7).Bold();
                                        header.Cell().Background("#1a3a5a").Padding(2).Text("Item").FontColor("#ffffff").FontSize(7).Bold();
                                        header.Cell().Background("#1a3a5a").Padding(2).Text("Grade").FontColor("#ffffff").FontSize(7).Bold();
                                        header.Cell().Background("#1a3a5a").Padding(2).Text("Date").FontColor("#ffffff").FontSize(7).Bold();
                                        header.Cell().Background("#1a3a5a").Padding(2).Text("Status").FontColor("#ffffff").FontSize(7).Bold();
                                    });

                                    foreach (var item in production.Take(50))
                                    {
                                        table.Cell().Padding(2).Text(item.ProductionCode ?? "-").FontSize(6);
                                        table.Cell().Padding(2).Text(item.Source ?? "-").FontSize(6);
                                        table.Cell().Padding(2).Text(item.Item ?? "-").FontSize(6);
                                        table.Cell().Padding(2).Text(item.Grade ?? "-").FontSize(6);
                                        table.Cell().Padding(2).Text(item.EntryDate.ToString("MM/dd")).FontSize(6);
                                        table.Cell().Padding(2).Text(item.Status ?? "-").FontSize(6);
                                    }
                                });
                                column.Item().PaddingVertical(5);
                            }

                            if (showByProductDolochar && byProduct.Any())
                            {
                                hasRenderedSection = true;
                                column.Item().Text($"By Product Dolochar (Total: {byProduct.Count})").FontSize(11).Bold();
                                column.Item().Table(table =>
                                {
                                    table.ColumnsDefinition(columns =>
                                    {
                                        columns.RelativeColumn(2);
                                        columns.RelativeColumn(2);
                                        columns.RelativeColumn(1);
                                        columns.RelativeColumn(1);
                                        columns.RelativeColumn(1);
                                        columns.RelativeColumn(1);
                                    });

                                    table.Header(header =>
                                    {
                                        header.Cell().Background("#1a3a5a").Padding(2).Text("ID").FontColor("#ffffff").FontSize(7).Bold();
                                        header.Cell().Background("#1a3a5a").Padding(2).Text("Production Code").FontColor("#ffffff").FontSize(7).Bold();
                                        header.Cell().Background("#1a3a5a").Padding(2).Text("Material").FontColor("#ffffff").FontSize(7).Bold();
                                        header.Cell().Background("#1a3a5a").Padding(2).Text("FC").FontColor("#ffffff").FontSize(7).Bold();
                                        header.Cell().Background("#1a3a5a").Padding(2).Text("Minus1mm").FontColor("#ffffff").FontSize(7).Bold();
                                        header.Cell().Background("#1a3a5a").Padding(2).Text("Status").FontColor("#ffffff").FontSize(7).Bold();
                                    });

                                    foreach (var item in byProduct.Take(50))
                                    {
                                        table.Cell().Padding(2).Text(item.Id ?? "-").FontSize(6);
                                        table.Cell().Padding(2).Text(item.ProductionCode ?? "-").FontSize(6);
                                        table.Cell().Padding(2).Text(item.Material ?? "-").FontSize(6);
                                        table.Cell().Padding(2).Text(item.Fc?.ToString() ?? "-").FontSize(6);
                                        table.Cell().Padding(2).Text(item.Minus1mm?.ToString() ?? "-").FontSize(6);
                                        table.Cell().Padding(2).Text(item.Status ?? "-").FontSize(6);
                                    }
                                });
                                column.Item().PaddingVertical(5);
                            }

                            if (showDispatchData && dispatch.Any())
                            {
                                hasRenderedSection = true;
                                column.Item().Text($"Dispatch (Total: {dispatch.Count})").FontSize(11).Bold();
                                column.Item().Table(table =>
                                {
                                    table.ColumnsDefinition(columns =>
                                    {
                                        columns.RelativeColumn(2);
                                        columns.RelativeColumn(1);
                                        columns.RelativeColumn(2);
                                        columns.RelativeColumn(2);
                                        columns.RelativeColumn(1);
                                        columns.RelativeColumn(1);
                                    });

                                    table.Header(header =>
                                    {
                                        header.Cell().Background("#1a3a5a").Padding(2).Text("ID").FontColor("#ffffff").FontSize(7).Bold();
                                        header.Cell().Background("#1a3a5a").Padding(2).Text("Month").FontColor("#ffffff").FontSize(7).Bold();
                                        header.Cell().Background("#1a3a5a").Padding(2).Text("Party").FontColor("#ffffff").FontSize(7).Bold();
                                        header.Cell().Background("#1a3a5a").Padding(2).Text("Destination").FontColor("#ffffff").FontSize(7).Bold();
                                        header.Cell().Background("#1a3a5a").Padding(2).Text("QTY").FontColor("#ffffff").FontSize(7).Bold();
                                        header.Cell().Background("#1a3a5a").Padding(2).Text("Status").FontColor("#ffffff").FontSize(7).Bold();
                                    });

                                    foreach (var item in dispatch.Take(50))
                                    {
                                        table.Cell().Padding(2).Text(item.Id ?? "-").FontSize(6);
                                        table.Cell().Padding(2).Text(item.Month ?? "-").FontSize(6);
                                        table.Cell().Padding(2).Text(item.PartyName ?? "-").FontSize(6);
                                        table.Cell().Padding(2).Text(item.Destination ?? "-").FontSize(6);
                                        table.Cell().Padding(2).Text(item.Qty?.ToString() ?? "-").FontSize(6);
                                        table.Cell().Padding(2).Text(item.Status ?? "-").FontSize(6);
                                    }
                                });
                                column.Item().PaddingVertical(5);
                            }

                            if (showStockCoal && stockCoal.Any())
                            {
                                hasRenderedSection = true;
                                column.Item().Text($"Stock House Coal (Total: {stockCoal.Count})").FontSize(11).Bold();
                                column.Item().Table(table =>
                                {
                                    table.ColumnsDefinition(columns =>
                                    {
                                        columns.RelativeColumn(2);
                                        columns.RelativeColumn(1);
                                        columns.RelativeColumn(2);
                                        columns.RelativeColumn(1);
                                        columns.RelativeColumn(1);
                                        columns.RelativeColumn(1);
                                    });

                                    table.Header(header =>
                                    {
                                        header.Cell().Background("#1a3a5a").Padding(2).Text("ID").FontColor("#ffffff").FontSize(7).Bold();
                                        header.Cell().Background("#1a3a5a").Padding(2).Text("TM").FontColor("#ffffff").FontSize(7).Bold();
                                        header.Cell().Background("#1a3a5a").Padding(2).Text("VM").FontColor("#ffffff").FontSize(7).Bold();
                                        header.Cell().Background("#1a3a5a").Padding(2).Text("ASH").FontColor("#ffffff").FontSize(7).Bold();
                                        header.Cell().Background("#1a3a5a").Padding(2).Text("Date").FontColor("#ffffff").FontSize(7).Bold();
                                        header.Cell().Background("#1a3a5a").Padding(2).Text("Status").FontColor("#ffffff").FontSize(7).Bold();
                                    });

                                    foreach (var item in stockCoal.Take(50))
                                    {
                                        table.Cell().Padding(2).Text(item.Id ?? "-").FontSize(6);
                                        table.Cell().Padding(2).Text(item.TM?.ToString() ?? "-").FontSize(6);
                                        table.Cell().Padding(2).Text(item.VM?.ToString() ?? "-").FontSize(6);
                                        table.Cell().Padding(2).Text(item.ASH?.ToString() ?? "-").FontSize(6);
                                        table.Cell().Padding(2).Text(item.EntryDate?.ToString("MM/dd") ?? "-").FontSize(6);
                                        table.Cell().Padding(2).Text(item.Status ?? "-").FontSize(6);
                                    }
                                });
                                column.Item().PaddingVertical(5);
                            }

                            if (showStockIron && stockIronOre.Any())
                            {
                                hasRenderedSection = true;
                                column.Item().Text($"Stock House Iron Ore (Total: {stockIronOre.Count})").FontSize(11).Bold();
                                column.Item().Table(table =>
                                {
                                    table.ColumnsDefinition(columns =>
                                    {
                                        columns.RelativeColumn(2);
                                        columns.RelativeColumn(1);
                                        columns.RelativeColumn(2);
                                        columns.RelativeColumn(1);
                                        columns.RelativeColumn(1);
                                        columns.RelativeColumn(1);
                                    });

                                    table.Header(header =>
                                    {
                                        header.Cell().Background("#1a3a5a").Padding(2).Text("ID").FontColor("#ffffff").FontSize(7).Bold();
                                        header.Cell().Background("#1a3a5a").Padding(2).Text("TM").FontColor("#ffffff").FontSize(7).Bold();
                                        header.Cell().Background("#1a3a5a").Padding(2).Text("FeT").FontColor("#ffffff").FontSize(7).Bold();
                                        header.Cell().Background("#1a3a5a").Padding(2).Text("LOI").FontColor("#ffffff").FontSize(7).Bold();
                                        header.Cell().Background("#1a3a5a").Padding(2).Text("Date").FontColor("#ffffff").FontSize(7).Bold();
                                        header.Cell().Background("#1a3a5a").Padding(2).Text("Status").FontColor("#ffffff").FontSize(7).Bold();
                                    });

                                    foreach (var item in stockIronOre.Take(50))
                                    {
                                        table.Cell().Padding(2).Text(item.Id ?? "-").FontSize(6);
                                        table.Cell().Padding(2).Text(item.TM?.ToString() ?? "-").FontSize(6);
                                        table.Cell().Padding(2).Text(item.FET?.ToString() ?? "-").FontSize(6);
                                        table.Cell().Padding(2).Text(item.LOI?.ToString() ?? "-").FontSize(6);
                                        table.Cell().Padding(2).Text(item.EntryDate?.ToString("MM/dd") ?? "-").FontSize(6);
                                        table.Cell().Padding(2).Text(item.Status ?? "-").FontSize(6);
                                    }
                                });
                                column.Item().PaddingVertical(5);
                            }

                            if (showStockDolomite && stockDolomite.Any())
                            {
                                hasRenderedSection = true;
                                column.Item().Text($"Stock House Dolomite (Total: {stockDolomite.Count})").FontSize(11).Bold();
                                column.Item().Table(table =>
                                {
                                    table.ColumnsDefinition(columns =>
                                    {
                                        columns.RelativeColumn(2);
                                        columns.RelativeColumn(1);
                                        columns.RelativeColumn(2);
                                        columns.RelativeColumn(1);
                                        columns.RelativeColumn(1);
                                        columns.RelativeColumn(1);
                                    });

                                    table.Header(header =>
                                    {
                                        header.Cell().Background("#1a3a5a").Padding(2).Text("ID").FontColor("#ffffff").FontSize(7).Bold();
                                        header.Cell().Background("#1a3a5a").Padding(2).Text("TM").FontColor("#ffffff").FontSize(7).Bold();
                                        header.Cell().Background("#1a3a5a").Padding(2).Text("Plus6mm").FontColor("#ffffff").FontSize(7).Bold();
                                        header.Cell().Background("#1a3a5a").Padding(2).Text("Minus1mm").FontColor("#ffffff").FontSize(7).Bold();
                                        header.Cell().Background("#1a3a5a").Padding(2).Text("Date").FontColor("#ffffff").FontSize(7).Bold();
                                        header.Cell().Background("#1a3a5a").Padding(2).Text("Status").FontColor("#ffffff").FontSize(7).Bold();
                                    });

                                    foreach (var item in stockDolomite.Take(50))
                                    {
                                        table.Cell().Padding(2).Text(item.Id ?? "-").FontSize(6);
                                        table.Cell().Padding(2).Text(item.TM?.ToString() ?? "-").FontSize(6);
                                        table.Cell().Padding(2).Text(item.Plus6mm?.ToString() ?? "-").FontSize(6);
                                        table.Cell().Padding(2).Text(item.Minus1mm?.ToString() ?? "-").FontSize(6);
                                        table.Cell().Padding(2).Text(item.EntryDate?.ToString("MM/dd") ?? "-").FontSize(6);
                                        table.Cell().Padding(2).Text(item.Status ?? "-").FontSize(6);
                                    }
                                });
                                column.Item().PaddingVertical(5);
                            }

                            if (showStockCharcoal && stockCharcoal.Any())
                            {
                                hasRenderedSection = true;
                                column.Item().Text($"Stock House Charcoal (Total: {stockCharcoal.Count})").FontSize(11).Bold();
                                column.Item().Table(table =>
                                {
                                    table.ColumnsDefinition(columns =>
                                    {
                                        columns.RelativeColumn(2);
                                        columns.RelativeColumn(1);
                                        columns.RelativeColumn(2);
                                        columns.RelativeColumn(1);
                                        columns.RelativeColumn(1);
                                        columns.RelativeColumn(1);
                                    });

                                    table.Header(header =>
                                    {
                                        header.Cell().Background("#1a3a5a").Padding(2).Text("ID").FontColor("#ffffff").FontSize(7).Bold();
                                        header.Cell().Background("#1a3a5a").Padding(2).Text("FC").FontColor("#ffffff").FontSize(7).Bold();
                                        header.Cell().Background("#1a3a5a").Padding(2).Text("Minus1mm").FontColor("#ffffff").FontSize(7).Bold();
                                        header.Cell().Background("#1a3a5a").Padding(2).Text("Remarks").FontColor("#ffffff").FontSize(7).Bold();
                                        header.Cell().Background("#1a3a5a").Padding(2).Text("Date").FontColor("#ffffff").FontSize(7).Bold();
                                        header.Cell().Background("#1a3a5a").Padding(2).Text("Status").FontColor("#ffffff").FontSize(7).Bold();
                                    });

                                    foreach (var item in stockCharcoal.Take(50))
                                    {
                                        table.Cell().Padding(2).Text(item.Id ?? "-").FontSize(6);
                                        table.Cell().Padding(2).Text(item.FC?.ToString() ?? "-").FontSize(6);
                                        table.Cell().Padding(2).Text(item.Minus1mm?.ToString() ?? "-").FontSize(6);
                                        table.Cell().Padding(2).Text(item.Remarks ?? "-").FontSize(6);
                                        table.Cell().Padding(2).Text(item.EntryDate?.ToString("MM/dd") ?? "-").FontSize(6);
                                        table.Cell().Padding(2).Text(item.Status ?? "-").FontSize(6);
                                    }
                                });
                                column.Item().PaddingVertical(5);
                            }

                            if (!hasRenderedSection)
                            {
                                column.Item().PaddingTop(12).Text("No records matched the selected filters.").FontSize(10).Italic();
                            }
                        });

                        page.Footer().AlignCenter().Text(x =>
                        {
                            x.Span("Page ");
                            x.CurrentPageNumber();
                            x.Span(" of ");
                            x.TotalPages();
                        });
                    });
                }).GeneratePdf();

                return File(pdfBytes, "application/pdf", "reports.pdf");
            }
            catch (Exception)
            {
                throw;
            }
        }

        [HttpGet("get-all-pending")]
        public async Task<IActionResult> GetAllPending()
        {
            try
            {
                var coal = await _context.CoalEntries.Where(x => x.Status == "Pending").ToListAsync();
                var pellets = await _context.PelletEntries.Where(x => x.Status == "Pending").ToListAsync();
                var ironOre = await _context.IronOreEntries.Where(x => x.Status == "Pending").ToListAsync();
                var dolomite = await _context.DolomiteEntries.Where(x => x.Status == "Pending").ToListAsync();
                var production = await _context.ProductionEntries.Where(x => x.Status == "Pending").ToListAsync();
                var dispatch = await _context.DispatchEntries.Where(x => x.Status == "Pending").ToListAsync();
                var stockCoal = await _context.StockHouseCoal.Where(x => x.Status == "Pending").ToListAsync();
                var stockIronOre = await _context.StockHouseIronOre.Where(x => x.Status == "Pending").ToListAsync();
                var stockDolomite = await _context.StockHouseDolomite.Where(x => x.Status == "Pending").ToListAsync();
                var stockCharcoal = await _context.StockHouseCharcoal.Where(x => x.Status == "Pending").ToListAsync();
                var byProduct = await _context.ByProductDolochars.Where(x => x.Status == "Pending").ToListAsync();

                return Ok(new
                {
                    coal,
                    pellets,
                    ironOre,
                    dolomite,
                    production,
                    byProductDolochar = byProduct,
                    dispatch,
                    stockCoal,
                    stockIronOre,
                    stockDolomite,
                    stockCharcoal
                });
            }
            catch (Exception)
            {
                throw;
            }
        }

        [HttpPost("update-status")]
        public async Task<IActionResult> UpdateStatus([FromBody] UpdateStatusRequest request)
        {
            try
            {
                var module = request.Module?.ToLower();
                var newStatus = request.NewStatus;
                var id = request.Id;

                if (module == "coal")
                {
                    var item = await _context.CoalEntries.FindAsync(id);
                    if (item != null) { item.Status = newStatus; }
                }
                else if (module == "pellets")
                {
                    var item = await _context.PelletEntries.FindAsync(id);
                    if (item != null) { item.Status = newStatus; }
                }
                else if (module == "ironore")
                {
                    var item = await _context.IronOreEntries.FindAsync(id);
                    if (item != null) { item.Status = newStatus; }
                }
                else if (module == "dolomite")
                {
                    var item = await _context.DolomiteEntries.FindAsync(id);
                    if (item != null) { item.Status = newStatus; }
                }
                else if (module == "production")
                {
                    ProductionEntry? item = null;
                    if (int.TryParse(id, out var productionDbId))
                    {
                        item = await _context.ProductionEntries.FindAsync(productionDbId);
                    }
                    if (item == null)
                    {
                        item = await _context.ProductionEntries
                            .FirstOrDefaultAsync(x => x.ProductionCode == id);
                    }
                    if (item != null) { item.Status = newStatus; }
                }
                else if (module == "byproductdolochar")
                {
                    var item = await _context.ByProductDolochars.FindAsync(id);
                    if (item != null) { item.Status = newStatus; }
                }
                else if (module == "dispatch")
                {
                    var item = await _context.DispatchEntries.FindAsync(id);
                    if (item != null) { item.Status = newStatus; }
                }
                else if (module == "stockcoal")
                {
                    var item = await _context.StockHouseCoal.FindAsync(id);
                    if (item != null) { item.Status = newStatus; }
                }
                else if (module == "stockironore")
                {
                    var item = await _context.StockHouseIronOre.FindAsync(id);
                    if (item != null) { item.Status = newStatus; }
                }
                else if (module == "stockdolomite")
                {
                    var item = await _context.StockHouseDolomite.FindAsync(id);
                    if (item != null) { item.Status = newStatus; }
                }
                else if (module == "stockcharcoal")
                {
                    var item = await _context.StockHouseCharcoal.FindAsync(id);
                    if (item != null) { item.Status = newStatus; }
                }

                await _context.SaveChangesAsync();
                return Ok(new { message = "Status updated successfully" });
            }
            catch (Exception)
            {
                throw;
            }
        }
        //===========================
        //SAP
        //============================
        //[HttpGet("sap-order/{orderNo}")]
        //public IActionResult GetSapOrder(string orderNo)
        //{
        //    var result = _sapService.GetProductionOrder(orderNo);
        //    return Ok(result);
        //}
    }

    public class RegisterRequest
    {
        public string UserId { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string? Role { get; set; }
        public string? Permissions { get; set; }
    }

    public class LoginRequest
    {
        public string UserId { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class ReportsFilterRequest
    {
        public List<string>? Dates { get; set; }
        public string? DateFrom { get; set; }
        public string? DateTo { get; set; }
        public List<string>? Testings { get; set; }
        public List<string>? Materials { get; set; }
    }

    public class UpdateStatusRequest
    {
        public string Id { get; set; } = string.Empty;
        public string Module { get; set; } = string.Empty;
        public string NewStatus { get; set; } = string.Empty;
    }
}




