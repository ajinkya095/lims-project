using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MaterialApi
{
    [Table("BYPRODUCTDOLOCHAR", Schema = "SYSTEM")]
    public class ByProductDolochar
    {
        [Key]
        [Column("ID")]
        public string? Id { get; set; }

        [Column("PRODUCTIONCODE")]
        public string? ProductionCode { get; set; }

        [Column("MATERIAL")]
        public string? Material { get; set; }

        [Column("FC")]
        public double? Fc { get; set; }

        [Column("MINUS1MM")]
        public double? Minus1mm { get; set; }

        [Column("STATUS")]
        public string? Status { get; set; }

        [Column("ENTRYDATE")]
        public DateTime? EntryDate { get; set; }
        [Column("FILLEDBY")]
        public string? FilledBy { get; set; }
    }
}
