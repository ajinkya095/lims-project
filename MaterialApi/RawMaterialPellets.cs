using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MaterialApi
{
    [Table("RAWMATERIALPELLETS")]
    public class RawMaterialPellets
    {
        [Key]
        [Column("PELLETID")]
        public string PelletId { get; set; } = string.Empty;

        [Column("MONTHNAME")]
        public string? MonthName { get; set; }  

        [Column("ENTRYDATE")]
        public DateTime? EntryDate { get; set; }

        [Column("SUPPLIER")]
        public string? Supplier { get; set; }

        [Column("MATERIALCODE")]
        public string? MaterialCode { get; set; }

        [Column("GATENUMBER")]
        public string? GateNumber { get; set; }

        [Column("PONUMBER")]
        public string? PoNumber { get; set; }

        [Column("TRUCKNO")]
        public string? TruckNo { get; set; }

        // Use double? (nullable) so if React doesn't send it, it doesn't crash
        [Column("P30MM")] public double? P30mm { get; set; }
        [Column("P25MM")] public double? P25mm { get; set; }
        [Column("P22MM")] public double? P22mm { get; set; }
        [Column("P20MM")] public double? P20mm { get; set; }

        [Column("P18MM")] public double? P18mm { get; set; }
        [Column("P15MM")] public double? P15mm { get; set; }
        [Column("P12MM")] public double? P12mm { get; set; }

        [Column("P10MM")] public double? P10mm { get; set; }

        [Column("P8MM")] public double? P8mm { get; set; }
        [Column("P5MM")] public double? P5mm { get; set; }
        [Column("P3MM")] public double? P3mm { get; set; }
        [Column("M3MM")] public double? M3mm { get; set; }
        [Column("OVERSIZE")] public double? oversize { get; set; }
        [Column("UNDERSIZE")] public double? undersize { get; set; }
        [Column("MPS")] public double? mps { get; set; }
        [Column("LATBD")] public double? latbd { get; set; }
        [Column("UNFIREDPCT")] public double? unfiredpct { get; set; }
        [Column("TIPCT")] public double? tipct { get; set; }
        [Column("AIPCT")] public double? aipct { get; set; }





        [Column("FETPCT")] public double? FeTPct { get; set; }
        [Column("IMAGEUPLOAD")] public string? ImageUpload { get; set; }
        [Column("REMARKS")] public string? Remarks { get; set; }
        [Column("FILLEDBY")] public string? FilledBy { get; set; }

        [Column("LOIPCT")] public double? loipct { get; set; }
        [Column("SIO2PCT")] public double? Sio2Pct { get; set; }
        [Column("AL2O3PCT")] public double? al2o3pct { get; set; }
        [Column("PPCT")] public double? ppct { get; set; }



        [Column("STATUS")]
        public string Status { get; set; } = "Pending";
    }
}
