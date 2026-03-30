namespace MaterialApi
{
    public class DispatchCreateDto
    {
        public string? SlNo { get; set; }
        public string? Month { get; set; }
        public DateTime? EntryDate { get; set; }
        public string? Material { get; set; }
        public string? TruckNo { get; set; }
        public string? PartyName { get; set; }
        public string? Destination { get; set; }
        public string? MaterialSize { get; set; }
        public double? Qty { get; set; }
        public double? FeM { get; set; }
        public double? Minus3mm { get; set; }
        public string? DispatchOfficer { get; set; }
        public string? Remarks { get; set; }
    }
}
