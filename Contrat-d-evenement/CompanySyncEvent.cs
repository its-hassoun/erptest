using System.Text.Json;

namespace ITANIS.SharedEvents
{
    public class CompanySyncEvent
    {
        public JsonElement Action { get; set; }
        public int Id { get; set; }
        public string RaisonSociale { get; set; } = string.Empty;
        public string? Secteur { get; set; }
        public string? EmailPrincipal { get; set; }
        public string? TelephonePrincipal { get; set; }
        public string? Adresse { get; set; }
        public string? CodePostal { get; set; }
        public string? Ville { get; set; }
        public string? Pays { get; set; }
        public string? MatriculeFiscal { get; set; }
        public string? Statut { get; set; }
        public decimal? MaxHeuresTraitementTicket { get; set; }
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