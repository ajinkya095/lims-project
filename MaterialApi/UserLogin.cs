using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MaterialApi
{
    [Table("QCLOGIN")]
    public class UserLogin
    {
        [Key]
        [Column("USERID")]
        public string UserId { get; set; } = string.Empty;

        [Column("PASSWORD")]
        public string Password { get; set; } = string.Empty;

        [Column("USERNAME")]
        public string? UserName { get; set; }

        [Column("ROLE")]
        public string Role { get; set; } = "user";

        // ✅ ADD THIS COLUMN IN DB
        [Column("PERMISSIONS")]
        public string? Permissions { get; set; }

        [Column("CREATEDAT")]
        public DateTime CreatedAt { get; set; }
    }
}
