using System.Text.Json;

namespace ITANIS.SharedEvents
{
    public class TicketCollaborateurSyncEvent
    {
        public JsonElement Action { get; set; }
        public int Id { get; set; }
        public int TicketId { get; set; }
        public int AgentId { get; set; }
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