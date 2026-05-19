using System.Text.Json;

namespace ITANIS.SharedEvents
{
    public class ContactSyncEvent
    {
        public JsonElement Action { get; set; }
        public int Id { get; set; }
        public int CompanyId { get; set; }
        public string Nom { get; set; } = string.Empty;
        public string Prenom { get; set; } = string.Empty;
        public string? Poste { get; set; }
        public string Email { get; set; } = string.Empty;
        public string? Telephone { get; set; }
        public string? TelephoneCountry { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime ChangedAt { get; set; } = DateTime.UtcNow;

        public string GetActionAsString()
        {
            if (Action.ValueKind == JsonValueKind.Number)
                return Action.GetInt32() switch
                {
                    0 => "Created",
                    1 => "Updated",
                    2 => "Deleted",
                    var v => $"Unknown({v})"
                };
            if (Action.ValueKind == JsonValueKind.String)
                return Action.GetString() ?? string.Empty;
            return string.Empty;
        }
    }
}