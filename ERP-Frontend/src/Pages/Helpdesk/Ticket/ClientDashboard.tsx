import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../../components/ui/Card';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Button } from '../../../components/ui/Button';

import { StatutTicket, type Ticket } from '../../../types/helpdesk';
import type { User } from '../../../types/user';

import {
  Ticket as TicketIcon,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  Send,
  User as UserIcon,
  Plus
} from 'lucide-react';

// Importation des mocks data centralisés
import { CLIENTS, USERS } from '../../../data/mockData';

interface ClientDashboardProps {
  tickets: Ticket[];
  currentUser: User;
  subclients: User[];
  onCloseTicket?: (ticketId: number, rating: number, comment: string) => void;
}

export function ClientDashboard({
  tickets,
  currentUser,
  subclients,
  onCloseTicket
}: ClientDashboardProps) {
  const navigate = useNavigate();
  
  const [evaluatingTicket, setEvaluatingTicket] = useState<Ticket | null>(null);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');

  // --- LOGIQUE DE MAPPING DE DONNÉES ---
  
  /**
   * Résout le problème 'clientName' de l'image_39685e.png
   * Cherche l'ID dans les Groupes ou les SubClients de CLIENTS_DATA
   */
  const getClientNameById = (id: number) => {
    for (const group of CLIENTS) {
      if (group.id === id) return group.name;
      const sub = group.subClients.find(s => s.id === id);
      if (sub) return sub.name;
    }
    return 'Client inconnu';
  };

  /**
   * Récupère l'Agent Dédié associé au compte du currentUser
   */
  const getDedicatedAgent = () => {
    // On identifie le groupe (Renault, Total, etc.) via le nom de l'équipe ou l'ID entreprise
    const group = CLIENTS.find(g => 
      g.name === currentUser.team || 
      g.id === (currentUser as any).clientCompanyId
    );
    
    if (group) {
      return USERS.find(u => u.id === group.agentDedieId);
    }
    return null;
  };

  const dedicatedAgent = getDedicatedAgent();

  // --- EFFETS ---

  // Déclenche la modal si un ticket est Clos mais n'a pas de Note
  useEffect(() => {
    const ticketRequiringAction = tickets.find(
      (t) => t.statut === StatutTicket.Clos && (!t.note || t.note === 0)
    );
    
    if (ticketRequiringAction) {
      setEvaluatingTicket(ticketRequiringAction);
    } else {
      setEvaluatingTicket(null);
    }
  }, [tickets]);

  // --- HANDLERS ---

  const handleFinalSubmit = () => {
    if (rating === 0 || !evaluatingTicket) return;
    
    if (onCloseTicket) {
      onCloseTicket(evaluatingTicket.id, rating, comment);
    }
    
    // Reset local
    setRating(0);
    setComment('');
    setEvaluatingTicket(null);
  };

  // Préparation des statistiques
  const stats = [
    { label: 'Total Tickets', value: tickets.length, icon: TicketIcon, color: 'bg-blue-500' },
    { label: 'Nouveaux', value: tickets.filter((t) => t.statut === StatutTicket.Nouveau).length, icon: AlertCircle, color: 'bg-cyan-500' },
    { label: 'En attente', value: tickets.filter((t) => t.statut === StatutTicket.EnAttente).length, icon: Clock, color: 'bg-amber-500' },
    { label: 'Résolus', value: tickets.filter((t) => t.statut === StatutTicket.Clos).length, icon: CheckCircle, color: 'bg-green-500' }
  ];

  const recentTickets = [...tickets]
    .sort((a, b) => new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime())
    .slice(0, 5);

  return (
    <div className="relative min-h-screen space-y-6 pb-10">
      
      {/* Header avec bouton d'action */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Tableau de bord</h2>
          <p className="text-sm font-medium text-slate-500">
            Entreprise : <span className="text-[#ef7c21] font-bold">{currentUser.team}</span>
          </p>
        </div>
        <Button 
          onClick={() => navigate('/new-ticket')}
          className="bg-[#ef7c21] hover:bg-[#d66a1a] text-white rounded-xl px-5 py-6 h-auto shadow-lg shadow-orange-100 transition-all hover:scale-105"
        >
          <Plus className="mr-2 h-5 w-5" />
          Nouveau Ticket
        </Button>
      </div>

      {/* Grille des Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-none shadow-sm flex items-center p-5">
            <div className={`p-3 rounded-2xl ${stat.color} bg-opacity-10 mr-4`}>
              <stat.icon className={`h-6 w-6 ${stat.color.replace('bg-', 'text-')}`} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-black text-slate-900">{stat.value}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Colonne de gauche : Tableau des tickets */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden border-none shadow-xl rounded-[2rem]" noPadding>
            <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-white">
              <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">Tickets Récents</h3>
              <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase" onClick={() => navigate('/company-tickets')}>
                Voir tout
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Sujet</th>
                    <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Demandeur</th>
                    <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentTickets.map((ticket) => (
                    <tr
                      key={ticket.id}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                      onClick={() => navigate(`/tickets/${ticket.id}`)}
                    >
                      <td className="px-8 py-5">
                        <div className="font-bold text-slate-800 text-sm group-hover:text-[#ef7c21] transition-colors">
                          {ticket.titre}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">#{ticket.id}</div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">
                          {getClientNameById(ticket.clientId)}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <StatusBadge status={ticket.statut} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Colonne de droite : Agent & Team */}
        <div className="space-y-6">
          
          {/* Widget Agent Dédié */}
          <Card className="bg-slate-900 border-none shadow-2xl rounded-[2rem] p-8 text-white relative overflow-hidden">
            <div className="absolute -right-4 -top-4 text-white/5 rotate-12">
              <UserIcon size={120} />
            </div>
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-6">Votre Expert Dédié</p>
              {dedicatedAgent ? (
                <div className="flex items-center gap-4">
                  <div className={`h-14 w-14 rounded-2xl ${dedicatedAgent.avatarColor} flex items-center justify-center text-xl font-black shadow-2xl`}>
                    {dedicatedAgent.avatarInitials}
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">{dedicatedAgent.name}</h4>
                    <p className="text-xs text-slate-400 italic">{dedicatedAgent.team} Support</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-500 italic">Assignation en cours...</p>
              )}
              <button className="mt-8 w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                Contacter l'expert
              </button>
            </div>
          </Card>

          {/* Liste des membres de l'équipe */}
          <Card className="border-none shadow-xl rounded-[2rem] p-8">
            <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest mb-6">Membres d'équipe</h3>
            <div className="space-y-4">
              {subclients.map((sub) => (
                <div key={sub.id} className="flex items-center gap-4 p-2 hover:bg-slate-50 rounded-2xl transition-colors">
                  <div className={`h-10 w-10 rounded-full ${sub.avatarColor} flex items-center justify-center text-xs text-white font-black shadow-inner`}>
                    {sub.avatarInitials}
                  </div>
                  <div className="text-xs truncate">
                    <p className="font-black text-slate-800">{sub.name}</p>
                    <p className="text-slate-400 font-medium italic truncate">{sub.email}</p>
                  </div>
                </div>
              ))}
              {subclients.length === 0 && (
                <div className="text-center py-6">
                  <p className="text-xs text-slate-400 italic">Aucun membre enregistré</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Modal d'évaluation (Système de blocage) */}
      {evaluatingTicket && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <Card className="w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl border-none overflow-hidden" noPadding>
            <div className="bg-[#10b981] px-8 py-6 text-white flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-2xl">
                <CheckCircle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-black leading-tight">Ticket Résolu !</h3>
                <p className="text-[10px] uppercase tracking-widest opacity-80 font-bold">Action requise pour débloquer</p>
              </div>
            </div>

            <div className="p-8 space-y-6">
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                <div className="flex justify-between items-center border-b border-slate-200/60 pb-3 mb-3">
                  <h4 className="font-black text-slate-800 text-sm">{evaluatingTicket.titre}</h4>
                  <span className="text-[10px] font-mono font-bold text-slate-400 bg-white px-2 py-1 rounded-lg border border-slate-100">
                    #{evaluatingTicket.id}
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed italic">
                  "Nous avons clôturé votre demande. Merci de nous accorder un instant pour évaluer la qualité de notre intervention."
                </p>
              </div>

              <div className="text-center space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Votre note</p>
                <div className="flex justify-center gap-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onMouseEnter={() => setHover(star)}
                      onMouseLeave={() => setHover(0)}
                      onClick={() => setRating(star)}
                      className="transition-transform hover:scale-125 active:scale-90 p-1"
                    >
                      <Star
                        className={`h-10 w-10 transition-colors ${
                          star <= (hover || rating) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200 fill-slate-50'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Commentaire libre</label>
                <textarea
                  rows={3}
                  className="w-full px-5 py-4 bg-slate-50 rounded-[1.5rem] text-sm border-none focus:ring-2 ring-[#10b981]/20 transition-all resize-none font-medium"
                  placeholder="Comment s'est passée l'intervention ?"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>

              <button
                disabled={rating === 0}
                onClick={handleFinalSubmit}
                className={`w-full py-5 rounded-[1.5rem] flex items-center justify-center gap-3 font-black text-xs uppercase tracking-[0.2em] transition-all ${
                  rating > 0
                    ? 'bg-[#10b981] text-white shadow-xl shadow-emerald-100 hover:bg-[#059669] hover:scale-[1.02]'
                    : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                }`}
              >
                <Send className="h-4 w-4" />
                Valider et débloquer
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}