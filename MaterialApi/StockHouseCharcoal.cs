using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

[Table("STOCKHOUSECHARCOAL", Schema = "SYSTEM")]
public class StockHouseCharcoal
{
    [Key]
    [Column("ID")]
    public string? Id { get; set; }

    [Column("FC")]
    public double? FC { get; set; }

    [Column("MINUS1MM")]
    public double? Minus1mm { get; set; }

    [Column("STATUS")]
    public string? Status { get; set; }

    [Column("ENTRYDATE")]
    public DateTime? EntryDate { get; set; }
    [Column("REMARKS")]
    public string? Remarks { get; set; }
    [Column("FILLEDBY")]
    public string? FilledBy { get; set; }
}
