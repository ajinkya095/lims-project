namespace MaterialApi;

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

[Table("APPFORMDRAFT")]
public class AppFormDraft
{
    [Key]
    [Column("DRAFTKEY")]
    public string DraftKey { get; set; } = string.Empty;

    [Column("MODULEKEY")] public string ModuleKey { get; set; } = string.Empty;
    [Column("ENTRYID")] public string EntryId { get; set; } = string.Empty;
    [Column("PAYLOADJSON")] public string PayloadJson { get; set; } = string.Empty;
    [Column("FILLEDBY")] public string? FilledBy { get; set; }
    [Column("LASTSAVEDAT")] public DateTime? LastSavedAt { get; set; }
    [Column("STATUS")] public string Status { get; set; } = "DRAFT";
}
