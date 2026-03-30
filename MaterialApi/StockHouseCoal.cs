using MaterialApi;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

[Table("STOCKHOUSECOAL", Schema = "SYSTEM")]
public class StockHouseCoal
{
    [Key]
    [Column("ID")]
    public string? Id { get; set; }

    [Column("MM25")] public double? MM25 { get; set; }
    [Column("MM22")] public double? MM22 { get; set; }
    [Column("MM20")] public double? MM20 { get; set; }
    [Column("MM18")] public double? MM18 { get; set; }
    [Column("MM15")] public double? MM15 { get; set; }
    [Column("MM12")] public double? MM12 { get; set; }
    [Column("MM10")] public double? MM10 { get; set; }
    [Column("MM8")] public double? MM8 { get; set; }
    [Column("MM6")] public double? MM6 { get; set; }
    [Column("MM5")] public double? MM5 { get; set; }
    [Column("MM3")] public double? MM3 { get; set; }
    [Column("MM1")] public double? MM1 { get; set; }
    [Column("MINUS1MM")] public double? Minus1mm { get; set; }
    [Column("TM")] public double? TM { get; set; }
    [Column("VM")] public double? VM { get; set; }
    [Column("ASH")] public double? ASH { get; set; }
    [Column("FC")] public double? FC { get; set; }
    [Column("MPS")] public double? MPS { get; set; }

    [Column("STATUS")] public string? Status { get; set; }
    [Column("ENTRYDATE")] public DateTime? EntryDate { get; set; }
    [Column("REMARKS")] public string? Remarks { get; set; }
    [Column("FILLEDBY")] public string? FilledBy { get; set; }
}
