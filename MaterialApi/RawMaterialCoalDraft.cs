namespace MaterialApi;

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

[Table("RAWMATERIALCOALDRAFT")]
public class RawMaterialCoalDraft
{
    [Key]
    [Column("COALID")]
    public string CoalId { get; set; } = string.Empty;

    [Column("FROMDATE")] public DateTime? FromDate { get; set; }
    [Column("MONTHNAME")] public string? MonthName { get; set; }
    [Column("ENTRYDATE")] public DateTime? EntryDate { get; set; }
    [Column("SOURCE")] public string? Source { get; set; }
    [Column("MATERIALCODE")] public string? MaterialCode { get; set; }
    [Column("GATENUMBER")] public string? GateNumber { get; set; }
    [Column("PONUMBER")] public string? PoNumber { get; set; }
    [Column("PARTY")] public string? Party { get; set; }
    [Column("CATEGORY")] public string? Category { get; set; }
    [Column("TRANSPORTER")] public string? Transporter { get; set; }
    [Column("TRUCKNO")] public string? TruckNo { get; set; }
    [Column("QTYMT")] public double? QtyMt { get; set; }
    [Column("MINUS3MM")] public double? Minus3mm { get; set; }
    [Column("MINUS4MM")] public double? Minus4mm { get; set; }
    [Column("MINUS6MM")] public double? Minus6mm { get; set; }
    [Column("MINUS1MM")] public double? Minus1mm { get; set; }
    [Column("STONES")] public double? Stones { get; set; }
    [Column("CSHALE")] public double? Cshale { get; set; }
    [Column("SULPHURPCT")] public double? SulphurPct { get; set; }
    [Column("IM")] public double? Im { get; set; }
    [Column("TM")] public double? Tm { get; set; }
    [Column("VM")] public double? Vm { get; set; }
    [Column("ASH")] public double? Ash { get; set; }
    [Column("FCADB")] public double? Fcadb { get; set; }
    [Column("FCDB")] public double? Fcdb { get; set; }
    [Column("GCVARB")] public double? Gcvarb { get; set; }
    [Column("GCVADB")] public double? Gcvadb { get; set; }
    [Column("IMAGEUPLOAD")] public string? ImageUpload { get; set; }
    [Column("REMARKS")] public string? Remarks { get; set; }
    [Column("FILLEDBY")] public string? FilledBy { get; set; }
    [Column("LASTSAVEDAT")] public DateTime? LastSavedAt { get; set; }
    [Column("STATUS")] public string Status { get; set; } = "DRAFT";
}
