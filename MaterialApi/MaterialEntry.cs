using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MaterialApi
{
    [Table("MATERIALENTRIES")]
    public class MaterialEntry
    {
        [Key]
        public string MaterialId { get; set; } = string.Empty;

        public string MaterialType { get; set; } = string.Empty;
        public string Status { get; set; } = "Pending";
        public DateTime EntryDate { get; set; } = DateTime.Now;

        // Add all your numeric parameters as double?
        public double? Mois { get; set; }
        public double? Ash { get; set; }
        // ... add all other parameters you defined in SQL ...
    }
}