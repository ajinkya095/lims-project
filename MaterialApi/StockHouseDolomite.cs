using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MaterialApi
{
    [Table("STOCKHOUSEDOLOMITE", Schema = "SYSTEM")]
    public class StockHouseDolomite
    {
        [Key]
        [Column("ID")]
        public string? Id { get; set; }

        [Column("TM")]
        public double? TM { get; set; }

        [Column("PLUS6MM")]
        public double? Plus6mm { get; set; }

        [Column("MINUS1MM")]
        public double? Minus1mm { get; set; }

        [Column("MPS")]
        public double? MPS { get; set; }

        [Column("STATUS")]
        public string? Status { get; set; }

        [Column("ENTRYDATE")]
        public DateTime? EntryDate { get; set; }
        [Column("REMARKS")]
        public string? Remarks { get; set; }
        [Column("FILLEDBY")]
        public string? FilledBy { get; set; }
    }
}
