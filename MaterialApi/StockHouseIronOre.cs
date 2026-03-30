using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MaterialApi
{
    [Table("STOCKHOUSEIRONORE", Schema = "SYSTEM")]
    public class StockHouseIronOre
    {
        [Key]
        [Column("ID")]
        public string? Id { get; set; }

        [Column("TM")] public double? TM { get; set; }
        [Column("FET")] public double? FET { get; set; }
        [Column("LOI")] public double? LOI { get; set; }
        [Column("PLUS18MM")] public double? Plus18mm { get; set; }
        [Column("MINUS8MM")] public double? Minus8mm { get; set; }
        [Column("MPS")] public double? MPS { get; set; }

        [Column("STATUS")] public string? Status { get; set; }
        [Column("ENTRYDATE")] public DateTime? EntryDate { get; set; }
        [Column("REMARKS")] public string? Remarks { get; set; }
        [Column("FILLEDBY")] public string? FilledBy { get; set; }
    }
}
