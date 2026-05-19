using System.Text.Json;

namespace ITANIS.SharedEvents
{
    public class AgentSyncEvent
    {
        public JsonElement Action { get; set; }
        public int Id { get; set; }
        public string Nom { get; set; } = string.Empty;
        public string Prenom { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Telephone { get; set; }
        public string Role { get; set; } = string.Empty;
        public string Poste { get; set; } = string.Empty;
        public string Departement { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
        public string? AgentType { get; set; }
        public decimal? CoutHoraire { get; set; }
        public decimal? Rating { get; set; }
        public DateTime ChangedAt { get; set; } = DateTime.UtcNow;

        public string GetActionAsString()
        {
            if (Action.ValueKind == JsonValueKind.Number)
            {
                int val = Action.GetInt32();
                return val switch
                {
                    0 => "Created",
                    1 => "Updated",
                    2 => "Deleted",
                    _ => $"Unknown({val})"
                };
            }
            if (Action.ValueKind == JsonValueKind.String)
                return Action.GetString() ?? string.Empty;

            return string.Empty;
        }
    }
}