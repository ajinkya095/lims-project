using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MaterialApi
{
    [Table("DispatchEntries", Schema = "SYSTEM")]
    public class DispatchEntry
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        [Column("ID")]
        public string? Id { get; set; }

        [Column("SLNO")]
        public string? SlNo { get; set; }

        [Column("MONTH")]
        public string? Month { get; set; }

        [Column("ENTRYDATE")]
        public DateTime? EntryDate { get; set; }

        [Column("MATERIAL")]
        public string? Material { get; set; }

        [Column("TRUCKNO")]
        public string? TruckNo { get; set; }

        [Column("PARTYNAME")]
        public string? PartyName { get; set; }

        [Column("DESTINATION")]
        public string? Destination { get; set; }

        [Column("MATERIALSIZE")]
        public string? MaterialSize { get; set; }

        [Column("QTY")]
        public double? Qty { get; set; }

        [Column("FEM")]
        public double? FeM { get; set; }

        [Column("MINUS3MM")]
        public double? Minus3mm { get; set; }

        [Column("DISPATCHOFFICER")]
        public string? DispatchOfficer { get; set; }

        [Column("REMARKS")]
        public string? Remarks { get; set; }

        [Column("STATUS")]
        public string? Status { get; set; }

        [Column("CREATEDDATE")]
        public DateTime? CreatedDate { get; set; }

        [Column("FILLEDBY")]
        public string? FilledBy { get; set; }
    }
}
