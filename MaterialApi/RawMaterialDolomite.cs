using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

[Table("RAWMATERIALDOLOMITE")]
public class RawMaterialDolomite
{
    [Key]
    [Column("DOLOMITEID")]
    public string DolomiteId { get; set; } = string.Empty;

    [Column("MONTHNAME")]
    public string? MonthName { get; set; }

    [Column("ENTRYDATE")]
    public DateTime? EntryDate { get; set; }

    // ✅ FIXED
    [Column("SRC")]
    public string? Source { get; set; }

    [Column("MATERIALCODE")]
    public string? MaterialCode { get; set; }

    [Column("GATENUMBER")]
    public string? GateNumber { get; set; }

    [Column("PONUMBER")]
    public string? PoNumber { get; set; }

    // ✅ FIXED
    [Column("MATERIALSIZE")]
    public string? Size { get; set; }

    [Column("QTY")]
    public double? Qty { get; set; }

    [Column("TRUCKNO")]
    public string? TruckNo { get; set; }

    [Column("MOISTUREPCT")]
    public double? MoisturePct { get; set; }

    [Column("PLUS8MM")]
    public double? Plus8mm { get; set; }

    [Column("PLUS6MM")]
    public double? Plus6mm { get; set; }

    [Column("PLUS2MM")]
    public double? Plus2mm { get; set; }

    [Column("PLUS1MM")]
    public double? Plus1mm { get; set; }

    [Column("MINUS1MM")]
    public double? Minus1mm { get; set; }

    [Column("CAOPCT")]
    public double? CaoPct { get; set; }

    [Column("MGOPCT")]
    public double? MgoPct { get; set; }

    [Column("SILICAPCT")]
    public double? SilicaPct { get; set; }

    [Column("LOIPCT")]
    public double? LoiPct { get; set; }
    [Column("IMAGEUPLOAD")]
    public string? ImageUpload { get; set; }
    [Column("REMARKS")]
    public string? Remarks { get; set; }
    [Column("FILLEDBY")]
    public string? FilledBy { get; set; }

    [Column("STATUS")]
    public string Status { get; set; } = "Pending";
}
