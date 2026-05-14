export const CategorieAction = {
  HelpDesk: 0,
  Developpement: 1,
  Windows: 2,
} as const;

// Création du type pour l'utiliser dans tes interfaces
export type CategorieAction = typeof CategorieAction[keyof typeof CategorieAction];

export const StatutTicket = {
  Nouveau: 0,
  EnAttente: 1,
  Rejete: 2,
  Ouvert: 3,
  EnPause: 4,
  Clos: 5,
  Reserve: 6,
} as const;

export type StatutTicket = typeof StatutTicket[keyof typeof StatutTicket];




export const PrioriteTicket = {
  Basse: 0,
  Moyenne: 1,
  Haute: 2,
  Critique: 3,
} as const;

export type PrioriteTicket = typeof PrioriteTicket[keyof typeof PrioriteTicket];

export interface FacturationResponse {
  TotalTickets: number
  Tickets: Ticket[]
  Periode: string
}

export interface Intervention {
  id: number;
  nom: string;
  description?: string;
  categorie: CategorieAction;
  prixForfaitaire: number;
  dureeEstimeeMinutes: number;
}

export interface KnowledgeSolution {
  id: number;
  descriptionResolution: string;
  agentId: number;
  dateResolution: string; 
  piecesJointesUrls: string[];
  knowledgeBaseId: number;
}

export interface KnowledgeBase {
  id: number;
  nomErreur: string;
  descriptionErreur: string;
  dateCreation: string;
  categorie: CategorieAction;
  solutions: KnowledgeSolution[];
}

export interface MessageTicket {
  id: number;
  ticketId: number;
  envoyeur: number;
  contenu: string;
  dateEnvoi: string;
  estLu: boolean;
}

export interface TicketCollaborateur {
  id: number;
  ticketId: number;
  agentId: number;
}

export interface Ticket {
  id: number;
  interventionId?: number;
  intervention?: Intervention;
  categorie: CategorieAction;
  titre: string;
  description: string;
  clientId: number;
  sousClientId?: number;
  statut: StatutTicket;
  priorite: PrioriteTicket;
  dateCreation: string;
  dateFermeture?: string;
  dureeReelleMinutes: number;
  coutFinal: number;
  agentPrincipalId?: number;
  codeUnidesk?: string;
  note?: number;
  commentaireAgent?: string;
  commentaireClient?: string;
  imagesUrls: string[];
  messages: MessageTicket[];
  collaborateurs: TicketCollaborateur[];
}

export const StatutLabels: Record<StatutTicket, string> = {
  [StatutTicket.Nouveau]: "Nouveau",
  [StatutTicket.EnAttente]: "En Attente",
  [StatutTicket.Rejete]: "Rejeté",
  [StatutTicket.Ouvert]: "Ouvert",
  [StatutTicket.EnPause]: "En Pause",
  [StatutTicket.Clos]: "Clos",
  [StatutTicket.Reserve]: "Réservé",
};

export const PrioriteLabels: Record<PrioriteTicket, string> = {
  [PrioriteTicket.Basse]: "Basse",
  [PrioriteTicket.Moyenne]: "Moyenne",
  [PrioriteTicket.Haute]: "Haute",
  [PrioriteTicket.Critique]: "Critique",
};