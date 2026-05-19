namespace ITANIS.SharedEvents;

public class DeclarationTempsSyncEvent
{
    public int DeclarationId { get; set; }

    public int EmployeIdRh { get; set; }          // was EmployeId
    public string EmployeNomComplet { get; set; } = string.Empty;
    public string EmployeAgentType { get; set; } = "interne";  // was missing

    public int SousTacheId { get; set; }
    public string SousTacheTitre { get; set; } = string.Empty;

    public int ProjetId { get; set; }
    public string ProjetNom { get; set; } = string.Empty;

    public DateTime Date { get; set; }
    public decimal DureeHeures { get; set; }
    public string Type { get; set; } = "Travail";

    public DateTime DeclaredAt { get; set; } = DateTime.UtcNow;
}