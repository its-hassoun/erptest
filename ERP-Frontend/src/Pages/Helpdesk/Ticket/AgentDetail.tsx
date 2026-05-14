import { useNavigate, useParams } from 'react-router-dom';
import { StatutTicket, CategorieAction } from '../../../types/helpdesk';
import type { Ticket } from '../../../types/helpdesk';
import type { User } from '../../../types/user';
import { Card } from '../../../components/ui/Card';
import { Avatar } from '../../../components/ui/Avatar';
import {
  ChevronLeft,
  Clock,
  CheckCircle,
  Activity,
  Star,
  Settings,
  Trash2,
  TrendingUp,
  Tag
} from 'lucide-react';

interface AgentDetailProps {
  users: User[];
  tickets: Ticket[];
  onEdit?: (agentId: number) => void;
  onDelete?: (agentId: number) => void;
}

export function AgentDetail({ users, tickets, onEdit, onDelete }: AgentDetailProps) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const agentIdNum = Number(id);
  const agent = users.find(
    (u) => u.id === agentIdNum && (u.role === 'agent' || u.role === 'Admin')
  );

  /**
   * Helper pour transformer la valeur numérique de la catégorie en texte
   */
  const getCategoryName = (catValue: number): string => {
    return Object.keys(CategorieAction).find(
      (key) => CategorieAction[key as keyof typeof CategorieAction] === catValue
    ) || 'Autre';
  };

  if (!agent) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="h-20 w-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-4">
          <Trash2 className="text-slate-300" size={32} />
        </div>
        <p className="text-slate-500 font-black uppercase tracking-widest text-xs">Agent introuvable</p>
        <button
          onClick={() => navigate('/agents')}
          className="mt-6 px-6 py-2 bg-[#ef7c21] text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-[#d96a1a] transition-all shadow-lg"
        >
          Retour à la liste
        </button>
      </div>
    );
  }

  // --- LOGIQUE DE DONNÉES ---

  const agentTickets = tickets.filter((t) => t.agentPrincipalId === agent.id);
  const ticketsWithNotes = agentTickets.filter((t) => t.note !== undefined && t.note !== null);

  // Moyenne globale
  const averageNote = ticketsWithNotes.length > 0
    ? ticketsWithNotes.reduce((acc, curr) => acc + (curr.note || 0), 0) / ticketsWithNotes.length
    : 0;

  // Nombre d'avis (tickets notés)
  const nbAvis = ticketsWithNotes.length;

  const assignedCount = agentTickets.filter((t) => t.statut !== StatutTicket.Clos).length;
  const resolvedCount = agentTickets.filter((t) => t.statut === StatutTicket.Clos).length;

  // --- CALCUL DE L'EXPERTISE (Par catégories de tickets clos) ---
  const closedTickets = agentTickets.filter(t => t.statut === StatutTicket.Clos);
  
  const expertiseMap = closedTickets.reduce((acc, ticket) => {
    const catName = getCategoryName(ticket.categorie);
    if (!acc[catName]) {
      acc[catName] = { totalNote: 0, count: 0 };
    }
    if (ticket.note !== undefined && ticket.note !== null) {
      acc[catName].totalNote += ticket.note;
      acc[catName].count += 1;
    }
    return acc;
  }, {} as Record<string, { totalNote: number; count: number }>);

  const expertiseSkills = Object.entries(expertiseMap)
    .map(([name, data]) => ({
      name,
      avg: data.count > 0 ? (data.totalNote / data.count).toFixed(1) : "N/A"
    }))
    .sort((a, b) => Number(b.avg) - Number(a.avg));

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Navigation & Actions */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => navigate('/agents')}
          className="group flex items-center text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[#ef7c21] transition-colors"
        >
          <ChevronLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" />
          Retour aux agents
        </button>

        <div className="flex gap-3">
          <button
            onClick={() => onEdit?.(agent.id)}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 hover:border-[#ef7c21]/30 text-slate-600 hover:text-[#ef7c21] rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm"
          >
            <Settings className="h-3.5 w-3.5" /> Modifier
          </button>
          <button
            onClick={() => onDelete?.(agent.id)}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
          >
            <Trash2 className="h-3.5 w-3.5" /> Supprimer
          </button>
        </div>
      </div>

      {/* Header Profile Card */}
      <Card className="rounded-[2.5rem] border-none shadow-xl overflow-hidden bg-white" noPadding>
        <div className="p-8 lg:p-10 flex flex-col lg:flex-row gap-8 items-center justify-between">
          <div className="flex flex-col sm:flex-row items-center gap-8 text-center sm:text-left">
            <div className="relative">
              <Avatar
                initials={agent.name[0]}
                size="lg"
                className="h-28 w-28 text-3xl font-black shadow-2xl ring-8 ring-slate-50 bg-slate-100 text-[#ef7c21]"
              />
              <span className="absolute bottom-2 right-2 block h-6 w-6 rounded-full bg-emerald-500 border-4 border-white" />
            </div>
            <div>
              <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-2">{agent.name}</h2>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4">
                <span className="text-[10px] font-black bg-orange-50 text-[#ef7c21] px-4 py-1.5 rounded-full uppercase tracking-widest border border-orange-100">
                  {agent.role}
                </span>
                <div className="flex items-center gap-1.5">
                  <Star className={`h-4 w-4 ${averageNote > 0 ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'}`} />
                  <span className="text-sm font-black text-slate-700">
                    {averageNote > 0 ? averageNote.toFixed(1) : "—"}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                    ({nbAvis} {nbAvis > 1 ? 'avis' : 'avis'})
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 w-full lg:w-auto">
            <div className="flex-1 lg:w-44 bg-orange-50/50 border border-orange-100 p-6 rounded-[2.5rem] text-center group hover:bg-[#ef7c21] transition-all duration-500">
              <Clock className="h-6 w-6 text-[#ef7c21] mx-auto mb-2 group-hover:text-white transition-colors" />
              <div className="text-4xl font-black text-[#ef7c21] group-hover:text-white mb-1">{assignedCount}</div>
              <div className="text-[9px] font-black text-orange-400 uppercase tracking-[0.2em] group-hover:text-orange-100">Ouverts</div>
            </div>
            <div className="flex-1 lg:w-44 bg-emerald-50 border border-emerald-100 p-6 rounded-[2.5rem] text-center group hover:bg-emerald-500 transition-all duration-500">
              <CheckCircle className="h-6 w-6 text-emerald-500 mx-auto mb-2 group-hover:text-white transition-colors" />
              <div className="text-4xl font-black text-emerald-700 group-hover:text-white mb-1">{resolvedCount}</div>
              <div className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em] group-hover:text-emerald-100">Résolus</div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Expertise Dynamique */}
        <Card className="lg:col-span-1 rounded-[2.5rem] p-8 border-none shadow-lg bg-white">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
            <TrendingUp className="h-4 w-4 text-[#ef7c21]" /> Scores par catégorie
          </p>

          <div className="space-y-4">
            {expertiseSkills.length > 0 ? (
              expertiseSkills.map((skill) => (
                <div key={skill.name} className="px-5 py-4 rounded-2xl border border-slate-100 flex items-center justify-between hover:bg-slate-50 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-orange-50 flex items-center justify-center text-[#ef7c21]">
                      <Tag size={14} />
                    </div>
                    <span className="text-xs font-bold text-slate-600 uppercase">{skill.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-slate-700">{skill.avg}</span>
                    <Star size={10} className="text-yellow-400 fill-yellow-400" />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center py-6 text-[10px] font-bold text-slate-300 uppercase tracking-widest italic">
                Aucune expertise notée
              </p>
            )}
          </div>
        </Card>

        {/* Recent Tickets Activity */}
        <Card className="lg:col-span-2 rounded-[2.5rem] p-8 border-none shadow-lg bg-white">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-[#ef7c21]" />
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Activité Récente</h3>
            </div>
          </div>

          <div className="space-y-4">
            {agentTickets.length > 0 ? (
              agentTickets.slice(0, 6).map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => navigate(`/tickets/${ticket.id}`)}
                  className="p-5 bg-white hover:bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between transition-all group cursor-pointer hover:translate-x-2"
                >
                  <div className="flex items-center gap-5">
                    <div className={`h-3 w-3 rounded-full shadow-sm ${
                        ticket.statut === StatutTicket.Clos ? 'bg-emerald-400' : 'bg-[#ef7c21]'
                      }`} 
                    />
                    <div>
                      <p className="font-black text-slate-800 group-hover:text-[#ef7c21] transition-colors text-sm">
                        #{ticket.id} — {ticket.titre}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-[10px] font-bold text-slate-400 uppercase">
                        <span>{getCategoryName(ticket.categorie)}</span>
                        <span className="h-1 w-1 rounded-full bg-slate-300" />
                        <span className={ticket.note ? "text-yellow-500" : ""}>
                          {ticket.note ? `Note: ${ticket.note}/5` : "Non noté"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    <span className="text-[10px] font-black text-slate-300">
                      {new Date(ticket.dateCreation).toLocaleDateString()}
                    </span>
                    <ChevronLeft className="h-4 w-4 text-slate-300 rotate-180" />
                  </div>
                </div>
              ))
            ) : (
              <div className="py-16 text-center border-4 border-dashed border-slate-50 rounded-[3rem]">
                <Activity className="h-12 w-12 text-slate-100 mx-auto mb-4" />
                <p className="text-xs font-black text-slate-300 uppercase tracking-[0.2em]">Aucun ticket</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}