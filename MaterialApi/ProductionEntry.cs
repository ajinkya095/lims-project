using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MaterialApi
{
    [Table("PRODUCTIONENTRIES", Schema = "SYSTEM")]
    public class ProductionEntry
    {
        [Key]
        [Column("ID")]
        public int Id { get; set; }

        [Column("PRODUCTIONCODE")]
        public string? ProductionCode { get; set; }

        [Column("SOURCE")]
        public string? Source { get; set; }

        [Column("AREA")]
        public string? Area { get; set; }

        [Column("ITEM")]
        public string? Item { get; set; }

        [Column("SHIFT")]
        public string? Shift { get; set; }

        [Column("FEM")]
        public double? FeM { get; set; }

        [Column("SULPHUR")]
        public double? Sulphur { get; set; }

        [Column("CARBON")]
        public double? Carbon { get; set; }

        [Column("NMAG")]
        public double? NMag { get; set; }

        [Column("OVERSIZE")]
        public double? OverSize { get; set; }

        [Column("UNDERSIZE")]
        public double? UnderSize { get; set; }

        [Column("BINNO")]
        public string? BinNo { get; set; }

        [Column("REMARKS")]
        public string? Remarks { get; set; }

        [Column("MAGINCHAR")]
        public double? MagInChar { get; set; }

        [Column("FEMINCHAR")]
        public double? FeMInChar { get; set; }

        [NotMapped]
        public string? ByProductMaterial { get; set; }

        [NotMapped]
        public double? ByProductFc { get; set; }

        [NotMapped]
        public double? ByProductMinus1mm { get; set; }

        [Column("GRADE")]
        public string? Grade { get; set; }

        [Column("STATUS")]
        public string Status { get; set; } = "Pending";

        [Column("ENTRYDATE")]
        public DateTime EntryDate { get; set; }
        [Column("FILLEDBY")]
        public string? FilledBy { get; set; }
    }
}
