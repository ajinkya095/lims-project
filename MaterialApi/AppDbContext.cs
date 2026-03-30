using Microsoft.EntityFrameworkCore;

namespace MaterialApi
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options) { }

        public DbSet<MaterialEntry> MaterialEntries { get; set; }
        public DbSet<AppFormDraft> FormDraftEntries { get; set; }
        public DbSet<ProductionEntry> ProductionEntries { get; set; }
        public DbSet<ByProductDolochar> ByProductDolochars { get; set; }
        public DbSet<DispatchEntry> DispatchEntries { get; set; }
        public DbSet<StockHouseCoal> StockHouseCoal { get; set; }

        public DbSet<RawMaterialCoal> CoalEntries { get; set; }
        public DbSet<RawMaterialCoalDraft> CoalDraftEntries { get; set; }
        public DbSet<RawMaterialPellets> PelletEntries { get; set; }
        public DbSet<RawMaterialIronOre> IronOreEntries { get; set; }

        // ✅ ONLY THIS USER TABLE
        public DbSet<UserLogin> UserLogins { get; set; }

        public DbSet<RawMaterialDolomite> DolomiteEntries { get; set; }
        public DbSet<StockHouseIronOre> StockHouseIronOre { get; set; }

        public DbSet<StockHouseDolomite> StockHouseDolomite { get; set; }
        public DbSet<StockHouseCharcoal> StockHouseCharcoal { get; set; }



        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
        }


        //public DbSet<StockHouseIronOre> StockHouseIronOre { get; set; }
        //public DbSet<StockHouseDolomite> StockHouseDolomite { get; set; }
        //public DbSet<StockHouseCharcoal> StockHouseCharcoal { get; set; }



    }
}
