import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ChevronLeft,
  Mail,
  Phone,
  Ticket as TicketIcon,
  Clock,
  CheckCircle2,
  UserPlus,
  X,
  Edit2,
  Trash2,
  Send,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

import { Card } from '../../../components/ui/Card';
import { Avatar } from '../../../components/ui/Avatar';
import { StatutTicket, PrioriteTicket ,type Ticket } from '../../../types/helpdesk';
import type { User } from '../../../types/user';
import { CLIENTS, USERS } from '../../../data/mockData';

interface ClientDetailProps {
  users: User[];
  tickets: Ticket[];
  onCreateTicket?: (data: any) => void;
  onUpdateSubclient?: (id: number, data: any) => void;
  onDeleteSubclient?: (id: number) => void;
}

export function ClientDetail({ users, tickets, onCreateTicket, onUpdateSubclient, onDeleteSubclient }: ClientDetailProps) {
  const navigate = useNavigate();

  const { id: idParam } = useParams<{ id: string }>();

  const [activeTab, setActiveTab] = useState<'tickets' | 'team'>('tickets');
  const [modalType, setModalType] = useState<'none' | 'ticket' | 'subclient'>('none');

  // Sub-client states
  const [editingSubclient, setEditingSubclient] = useState<User | null>(null);
  const [subForm, setSubForm] = useState({ name: '', email: '', password: '' });

  // Ticket form state
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    service: 'helpdesk',
    priority: 'moyenne',
    description: ''
  });

  // --- LOGIQUE DE RÉCUPÉRATION ---
const clientId = idParam ? parseInt(idParam, 10) : null;
const client = users.find((u) => Number(u.id) === clientId && u.role === 'client');
const subclients = users.filter((u) => u.role === 'subclient' && u.clientCompanyId === clientId);
  
  // Trouver l'agent dédié pour ce client dans les données de configuration
  const clientConfig = CLIENTS.find(c => c.id === Number(idParam));
  const dedicatedAgent = USERS.find(u => u.id === clientConfig?.agentDedieId);

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
        <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Client introuvable</p>
        <button
          onClick={() => navigate('/clients')}
          className="mt-6 bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all"
        >
          Retour à la liste
        </button>
      </div>
    );
  }

  const clientTickets = tickets.filter((t) => t.clientId === Number(client.id));
  const openTicketsCount = clientTickets.filter((t) => t.statut !== StatutTicket.Clos).length;

  // --- HANDLERS ---
  const closeModal = () => {
    setModalType('none');
    setEditingSubclient(null);
    setSubForm({ name: '', email: '', password: '' });
    setTicketForm({ subject: '', service: 'helpdesk', priority: 'moyenne', description: '' });
  };

  const handleEditClick = (sub: User) => {
    setEditingSubclient(sub);
    setSubForm({ name: sub.name, email: sub.email, password: '' });
    setModalType('subclient');
  };

  const handleDeleteSub = (subId: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce membre ?')) {
      onDeleteSubclient?.(subId);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (modalType === 'ticket') {
      onCreateTicket?.({ ...ticketForm, clientId: client.id });
    } else {
      if (editingSubclient) {
        onUpdateSubclient?.(editingSubclient.id, subForm);
      } else {
        // Logique création...
      }
    }
    closeModal();
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* Modal - Reprise de ton design épuré */}
      {modalType !== 'none' && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 backdrop-blur-md bg-slate-900/60 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl">
            <div className="bg-[#ef7c21] p-8 text-white flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black uppercase tracking-tight">
                  {modalType === 'ticket' ? 'Nouveau Ticket' : editingSubclient ? 'Modifier Membre' : 'Nouveau Membre'}
                </h3>
                <p className="text-orange-100 text-[10px] font-black uppercase tracking-widest mt-1 opacity-80 italic">
                  Compte: {client.team}
                </p>
              </div>
              <button onClick={closeModal} className="p-3 hover:bg-black/10 rounded-full transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>

            <form className="p-8 space-y-4" onSubmit={handleSubmit}>
              {modalType === 'ticket' ? (
                <>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sujet</p>
                    <input
                      type="text" required placeholder="Problème de connexion..."
                      className="w-full px-5 py-4 bg-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 ring-orange-100 transition-all"
                      onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Service</p>
                      <select 
                        className="w-full px-5 py-4 bg-slate-100 rounded-2xl text-sm font-bold focus:outline-none appearance-none"
                        value={ticketForm.service}
                        onChange={(e) => setTicketForm({ ...ticketForm, service: e.target.value })}
                      >
                        <option value="helpdesk">Helpdesk</option>
                        <option value="windows">Windows</option>
                        <option value="developpement">Développement</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Priorité</p>
                      <select 
                        className="w-full px-5 py-4 bg-slate-100 rounded-2xl text-sm font-bold focus:outline-none appearance-none"
                        value={ticketForm.priority}
                        onChange={(e) => setTicketForm({ ...ticketForm, priority: e.target.value })}
                      >
                        <option value="bas">Bas</option>
                        <option value="moyenne">Moyenne</option>
                        <option value="élevé">Élevé</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</p>
                    <textarea
                      rows={4} required placeholder="Détaillez votre demande..."
                      className="w-full px-5 py-4 bg-slate-100 rounded-2xl text-sm font-bold focus:outline-none resize-none"
                      onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nom Complet</p>
                    <input
                      type="text" required value={subForm.name}
                      className="w-full px-5 py-4 bg-slate-100 rounded-2xl text-sm font-bold focus:outline-none"
                      onChange={(e) => setSubForm({ ...subForm, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</p>
                    <input
                      type="email" required value={subForm.email}
                      className="w-full px-5 py-4 bg-slate-100 rounded-2xl text-sm font-bold focus:outline-none"
                      onChange={(e) => setSubForm({ ...subForm, email: e.target.value })}
                    />
                  </div>
                </>
              )}

              <button
                type="submit"
                className="w-full bg-[#ef7c21] text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl h-16 shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 mt-4"
              >
                {modalType === 'ticket' ? <Send className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                {modalType === 'ticket' ? 'Envoyer le Ticket' : editingSubclient ? 'Mettre à jour' : 'Ajouter au compte'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Navigation & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-4">
          <button
            onClick={() => navigate('/clients')}
            className="group flex items-center text-slate-400 hover:text-[#ef7c21] transition-colors"
          >
            <ChevronLeft className="h-5 w-5 mr-1 group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest">Retour au listing</span>
          </button>
          
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar
                initials={client.avatarInitials}
                size="lg"
                className="h-24 w-24 text-2xl font-black shadow-2xl ring-4 ring-white bg-gradient-to-br from-[#ef7c21] to-orange-400 text-white"
              />
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-2 rounded-xl shadow-lg border-2 border-white">
                <ShieldCheck className="h-4 w-4" />
              </div>
            </div>
            <div>
              <h2 className="text-4xl font-black text-slate-900 tracking-tighter">{client.name}</h2>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-[9px] font-black bg-slate-900 text-white px-3 py-1.5 rounded-lg uppercase tracking-widest">
                  Compte Principal
                </span>
                <span className="text-xs font-bold text-slate-400 italic">
                  ID: {client.id} • {client.team}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
           <button className="bg-white border-2 border-slate-100 p-5 rounded-2xl hover:border-[#ef7c21] hover:text-[#ef7c21] transition-all shadow-sm">
             <Mail className="h-6 w-6" />
           </button>
           <button
             onClick={() => setModalType('ticket')}
             className="bg-[#ef7c21] text-white px-8 py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-orange-100 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
           >
             <TicketIcon className="h-4 w-4" /> Nouveau Ticket
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar Info */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Key Metrics */}
          <Card className="rounded-[2.5rem] p-8 shadow-xl border-none bg-white">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#ef7c21]" /> État du compte
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-orange-50/50 p-6 rounded-3xl border border-orange-100 text-center">
                <p className="text-[9px] font-black text-[#ef7c21] uppercase tracking-tighter mb-1">En cours</p>
                <p className="text-3xl font-black text-slate-900">{openTicketsCount}</p>
              </div>
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 text-center">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mb-1">Membres</p>
                <p className="text-3xl font-black text-slate-900">{subclients.length}</p>
              </div>
            </div>
          </Card>

          {/* Expert Dédié Widget */}
          <Card className="rounded-[2.5rem] p-8 shadow-xl border-none bg-slate-900 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
               <UserCheck size={80} />
            </div>
            <div className="relative z-10">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Expert Dédié</p>
              {dedicatedAgent ? (
                <div className="flex items-center gap-4">
                  <div className={`h-12 w-12 rounded-2xl ${dedicatedAgent.avatarColor} flex items-center justify-center text-lg font-black shadow-lg`}>
                    {dedicatedAgent.avatarInitials}
                  </div>
                  <div>
                    <p className="font-black text-sm">{dedicatedAgent.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{dedicatedAgent.team}</p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">Aucun expert assigné</p>
              )}
            </div>
          </Card>

          {/* Coordonnées */}
          <Card className="rounded-[2.5rem] p-8 shadow-xl border-none bg-white">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Informations directes</p>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl hover:bg-blue-50 transition-colors group cursor-pointer">
                <Mail className="h-4 w-4 text-slate-400 group-hover:text-blue-500" />
                <span className="text-xs font-bold text-slate-600 truncate">{client.email}</span>
              </div>
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl hover:bg-emerald-50 transition-colors group cursor-pointer">
                <Phone className="h-4 w-4 text-slate-400 group-hover:text-emerald-500" />
                <span className="text-xs font-bold text-slate-600">+33 1 23 45 67 89</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Dynamic Content Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex gap-2 p-1.5 bg-slate-100 rounded-[2rem] w-fit">
            <button
              onClick={() => setActiveTab('tickets')}
              className={`px-8 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === 'tickets'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Historique Tickets
            </button>
            <button
              onClick={() => setActiveTab('team')}
              className={`px-8 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === 'team'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Équipe ({subclients.length})
            </button>
          </div>

          {activeTab === 'tickets' ? (
            <Card className="rounded-[3rem] border-none shadow-xl overflow-hidden bg-white" noPadding>
              <div className="divide-y divide-slate-100">
                {clientTickets.length > 0 ? (
                  clientTickets.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => navigate(`/tickets/${t.id}`)}
                      className="p-8 hover:bg-slate-50/80 transition-all cursor-pointer flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-5">
                        <div className={`h-14 w-14 rounded-2xl flex items-center justify-center transition-all ${
                          t.statut === StatutTicket.Clos ? 'bg-emerald-50 text-emerald-500 shadow-inner' : 'bg-orange-50 text-[#ef7c21]'
                        }`}>
                          {t.statut === StatutTicket.Clos ? <CheckCircle2 className="h-7 w-7" /> : <Clock className="h-7 w-7" />}
                        </div>
                        <div>
                          <p className="text-md font-black text-slate-800 group-hover:text-[#ef7c21] transition-colors">
                            {t.titre}
                          </p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-[10px] font-mono font-bold text-slate-400">#{t.id}</span>
                            <span className="h-1 w-1 rounded-full bg-slate-300" />
                            <p className="text-[10px] font-bold text-slate-400 italic">
                              crée le  {t.dateCreation}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                          t.priorite === PrioriteTicket.Haute ? 'bg-red-50 text-red-500' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {t.priorite}
                        </span>
                        <ChevronLeft className="h-5 w-5 text-slate-300 rotate-180 group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-20 text-center flex flex-col items-center gap-4">
                    <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                      <TicketIcon className="h-10 w-10" />
                    </div>
                    <p className="text-xs font-black text-slate-300 uppercase tracking-widest">Aucun ticket enregistré</p>
                  </div>
                )}
              </div>
            </Card>
          ) : (
            <Card className="rounded-[3rem] border-none shadow-xl overflow-hidden bg-white" noPadding>
              <div className="p-10 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Utilisateurs Autorisés</h3>
                  <p className="text-xs text-slate-400 font-medium mt-1">Membres ayant accès au support</p>
                </div>
                <button
                  onClick={() => setModalType('subclient')}
                  className="flex items-center bg-slate-900 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg"
                >
                  <UserPlus className="h-4 w-4 mr-2" /> Ajouter
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <tbody className="divide-y divide-slate-50">
                    {subclients.map((sub) => (
                      <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-10 py-6">
                          <div className="flex items-center gap-4">
                            <Avatar
                              initials={sub.name[0]}
                              className="bg-slate-100 text-[#ef7c21] font-black h-12 w-12 rounded-2xl"
                            />
                            <div>
                              <div className="text-sm font-black text-slate-800">{sub.name}</div>
                              <div className="text-[11px] text-slate-400 font-medium">{sub.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-10 py-6">
                          <span className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase italic">
                            <ShieldCheck className="h-3.5 w-3.5" /> Sub-client
                          </span>
                        </td>
                        <td className="px-10 py-6 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleEditClick(sub)}
                              className="p-3 bg-white border border-slate-200 text-slate-600 rounded-xl hover:border-[#ef7c21] hover:text-[#ef7c21] transition-all shadow-sm"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteSub(sub.id)}
                              className="p-3 bg-white border border-slate-200 text-slate-600 rounded-xl hover:border-red-500 hover:text-red-500 transition-all shadow-sm"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}