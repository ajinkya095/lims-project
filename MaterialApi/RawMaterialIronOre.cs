namespace MaterialApi;

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

[Table("RAWMATERIALIRONORE")]
public class RawMaterialIronOre
{
    [Key]
    [Column("IRONOREID")]
    public string IronOreId { get; set; } = string.Empty;
    [Column("MONTHNAME")] public string? MonthName { get; set; }
    [Column("ENTRYDATE")] public DateTime EntryDate { get; set; } = DateTime.Now;
    [Column("SAMPLENO")] public string? SampleNo { get; set; }
    [Column("SUPPLIER_SOURCE")] public string? SupplierSource { get; set; }
    [Column("MATERIALCODE")] public string? MaterialCode { get; set; }
    [Column("GATENUMBER")] public string? GateNumber { get; set; }
    [Column("PONUMBER")] public string? PoNumber { get; set; }
    [Column("QTY")] public double? Qty { get; set; }
    [Column("TRUCKNO")] public string? TruckNo { get; set; }
    [Column("MOISTURE_PCT")] public double? MoisturePct { get; set; }
    [Column("PLUS30")] public double? Plus30 { get; set; }
    [Column("PLUS25")] public double? Plus25 { get; set; }
    [Column("PLUS22")] public double? Plus22 { get; set; }
    [Column("PLUS20")] public double? Plus20 { get; set; }
    [Column("PLUS18")] public double? Plus18 { get; set; }
    [Column("PLUS15")] public double? Plus15 { get; set; }
    [Column("PLUS10")] public double? Plus10 { get; set; }
    [Column("PLUS8")] public double? Plus8 { get; set; }
    [Column("PLUS5")] public double? Plus5 { get; set; }
    [Column("PLUS3")] public double? Plus3 { get; set; }
    [Column("PLUS1")] public double? Plus1 { get; set; }
    [Column("MINUS1")] public double? Minus1 { get; set; }
    [Column("OVERSIZE")] public double? Oversize { get; set; }
    [Column("UNDERSIZE")] public double? Undersize { get; set; }
    [Column("MPS")] public double? Mps { get; set; }
    [Column("LATERITE")] public double? Laterite { get; set; }
    [Column("BLUE_DUST")] public double? BlueDust { get; set; }
    [Column("SHALE_STONE")] public double? ShaleStone { get; set; }
    [Column("TUMBLER_INDEX")] public double? TumblerIndex { get; set; }
    [Column("ACCRETION_INDEX")] public double? AccretionIndex { get; set; }
    [Column("FE_TOTAL")] public double? FeTotal { get; set; }
    [Column("LOI")] public double? Loi { get; set; }
    [Column("SIO2")] public double? Sio2 { get; set; }
    [Column("AL2O3")] public double? Al2o3 { get; set; }
    [Column("PHOSPHORUS")] public double? Phosphorus { get; set; }
    [Column("IMAGEUPLOAD")] public string? ImageUpload { get; set; }
    [Column("REMARKS")] public string? Remarks { get; set; }
    [Column("FILLEDBY")] public string? FilledBy { get; set; }

    [Column("STATUS")] public string Status { get; set; } = "Pending";
}
