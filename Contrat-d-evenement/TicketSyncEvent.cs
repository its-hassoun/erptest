using System.Text.Json;

namespace ITANIS.SharedEvents
{
    public class TicketSyncEvent
    {
        public JsonElement Action { get; set; }
        public int Id { get; set; }
        public int? InterventionId { get; set; }
        public string Categorie { get; set; } = string.Empty;
        public string Titre { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int ClientId { get; set; }
        public int? SousClientId { get; set; }
        public string Statut { get; set; } = string.Empty;
        public string Priorite { get; set; } = string.Empty;
        public DateTime DateCreation { get; set; }
        public DateTime? DateFermeture { get; set; }
        public double DureeReelleMinutes { get; set; }
        public double CoutFinal { get; set; }
        public int AgentPrincipalId { get; set; }
        public string? CodeUnidesk { get; set; }
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