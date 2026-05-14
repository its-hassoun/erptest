import { useState, useEffect } from 'react'; // Ajout de hooks
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';
import { ticketService } from '../Services/helpdesk/ticketService'; // Ton service
import { StatutTicket, type Ticket } from '../types/helpdesk';
import type { User } from '../types/user';
import { Loader2 } from 'lucide-react'; // Pour le loading state

import {
  Ticket as TicketIcon,
  Clock,
  CheckCircle,
  AlertCircle,
  CirclePause
} from 'lucide-react';
import { CLIENTS } from '../data/mockData';

interface DashboardProps {
  currentUser: User;
}

export function Dashboard({ currentUser }: DashboardProps) {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  // --- FETCH DES DONNÉES ---
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        const data = await ticketService.getAll();
        setTickets(data);
      } catch (error) {
        console.error("Erreur backend:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

  const getClientInfo = (id: number | string) => {
    const numericId = Number(id);
    for (const group of CLIENTS) {
      if (group.id === numericId) return { name: group.name, email: group.email };
      const sub = group.subClients.find(s => s.id === numericId);
      if (sub) return { name: sub.name, email: sub.email };
    }
    return { name: 'Inconnu', email: '—' };
  };

  const visibleTickets = tickets;

  const stats = [
    { label: 'Total Tickets', value: visibleTickets.length, icon: TicketIcon, color: 'bg-blue-500' },
    { label: 'Fresh', value: visibleTickets.filter(t => t.statut === StatutTicket.Nouveau).length, icon: AlertCircle, color: 'bg-cyan-500' },
    { label: 'Pending', value: visibleTickets.filter(t => t.statut === StatutTicket.EnAttente).length, icon: Clock, color: 'bg-amber-500' },
    { label: 'Paused', value: visibleTickets.filter(t => t.statut === StatutTicket.EnPause).length, icon: CirclePause, color: 'bg-purple-500' },
    { label: 'Closed', value: visibleTickets.filter(t => t.statut === StatutTicket.Clos).length, icon: CheckCircle, color: 'bg-green-500' }
  ];

  const recentTickets = [...visibleTickets]
    .sort((a, b) => new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime())
    .slice(0, 5);

  // --- RENDER LOADING ---
  if (loading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-slate-500">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-2" />
        <p>Synchronisation avec le serveur...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium text-slate-900">aperçu</h2>
          <p className="text-sm text-slate-500">Bienvenue, {currentUser.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="flex items-center p-4">
            <div className={`p-3 rounded-lg ${stat.color} bg-opacity-10 mr-4`}>
              <stat.icon className={`h-6 w-6 ${stat.color.replace('bg-', 'text-')}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            </div>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden" noPadding>
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-white">
          <h3 className="font-semibold text-slate-900">Tickets Récents</h3>
          <Button variant="ghost" size="sm" onClick={() => navigate('/tickets')}>Voir tout</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Sujet</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Demandeur</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {recentTickets.map((ticket) => {
                const client = getClientInfo(ticket.clientId);
                return (
                  <tr key={ticket.id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => navigate(`/tickets/${ticket.id}`)}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900">{ticket.titre}</div>
                      <div className="text-xs text-slate-500">#{ticket.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900 font-semibold">{client.name}</div>
                      <div className="text-xs text-slate-500">{client.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={ticket.statut} /></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{new Date(ticket.dateCreation).toLocaleDateString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}