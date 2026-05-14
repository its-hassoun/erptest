import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Pause, StopCircle, Play, MessageSquare, Send, X,
  Ban, ArrowRightLeft, Calendar, Check,
  Layers, Loader2
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { ticketService } from '../../../Services/helpdesk/ticketService';
import { StatutTicket, PrioriteTicket ,type Ticket } from '../../../types/helpdesk';
import type { User } from '../../../types/user';

const STATUS_MAP: Record<number, { label: string, color: string }> = {
  0: { label: 'Nouveau', color: 'text-blue-500' },
  1: { label: 'En Attente', color: 'text-amber-500' },
  2: { label: 'Rejeté', color: 'text-red-500' },
  3: { label: 'Ouvert', color: 'text-emerald-500' },
  4: { label: 'En Pause', color: 'text-slate-400' },
  5: { label: 'Clos', color: 'text-emerald-700' },
  6: { label: 'Réservé', color: 'text-purple-500' }
};

const CATEGORY_MAP: Record<number, string> = {
  0: 'HelpDesk',
  1: 'Développement',
  2: 'Windows'
};

interface TicketDetailProps {
  currentUser: User;
  // Correction ici : on change 'number' par 'any' pour matcher avec ta fonction handleUpdateTicketStatus
  onUpdateStatus: (id: string, status: any, userId?: number) => void; 
}

export function TicketDetail({ currentUser, onUpdateStatus }: TicketDetailProps) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showResolution, setShowResolution] = useState(false);
  const [message, setMessage] = useState('');
  const [workDone, setWorkDone] = useState('');
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: 'agent', name: 'Support', text: "Bonjour, je prends en charge votre demande.", time: '14:32' },
    { id: 2, sender: 'client', name: 'Client', text: "Merci, j'attends votre retour.", time: '14:35' }
  ]);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    async function loadTicket() {
      if (!id) return;
      try {
        setLoading(true);
        const data = await ticketService.getById(Number(id));
        setTicket(data);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    loadTicket();
  }, [id]);

  const userRole = (currentUser.role || '').toLowerCase();
  const isStaff = userRole === 'admin' || userRole === 'agent';
  const isAdmin = userRole === 'admin';

  // Utilisation des entiers de l'image StatutTicket
  const isFresh = ticket?.statut === 0; 
  const isWorkable = ticket?.statut === 3 || ticket?.statut === 1 || ticket?.statut === 4; 
  const isRejected = ticket?.statut === 2;
  const isClosed = ticket?.statut === 5;

  useEffect(() => {
    if (isWorkable && !isPaused && !showResolution && isStaff) {
      timerRef.current = setInterval(() => setSecondsElapsed((prev) => prev + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isWorkable, isPaused, showResolution, isStaff]);

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), sec = s % 60;
    return `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m ${String(sec).padStart(2, '0')}s`;
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;
    const now = new Date();
    setChatMessages([...chatMessages, {
      id: Date.now(),
      sender: isStaff ? 'agent' : 'client',
      name: isStaff ? 'Support' : 'Client',
      text: message.trim(),
      time: `${now.getHours()}:${now.getMinutes()}`
    }]);
    setMessage('');
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-[#ef7c21]" /></div>;
  if (error || !ticket) return <div className="p-10 text-center">Ticket non trouvé</div>;

  return (
    <div className="relative min-h-screen bg-slate-50 p-4 md:p-8">
      
      {/* MODAL RÉSOLUTION */}
      {showResolution && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 backdrop-blur-md bg-slate-900/40">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl">
            <h3 className="font-bold mb-4">Finaliser l'intervention</h3>
            <textarea
              className="w-full p-4 border-2 border-orange-100 rounded-xl mb-4 h-32 outline-none"
              value={workDone}
              onChange={(e) => setWorkDone(e.target.value)}
              placeholder="Description des actions effectuées..."
            />
            <button
              onClick={() => { onUpdateStatus(String(ticket.id), 5); setShowResolution(false); }}
              className="w-full bg-emerald-500 text-white py-3 rounded-xl font-bold"
            >
              CLÔTURER
            </button>
          </div>
        </div>
      )}

      <div className={`transition-all ${isChatOpen ? 'lg:pr-[450px]' : ''}`}>
        <button onClick={() => navigate(-1)} className="flex items-center text-slate-400 font-bold mb-6">
          <ArrowLeft className="mr-2" /> RETOUR
        </button>

        <Card className="overflow-hidden bg-white rounded-[2.5rem] shadow-xl">
          <div className={`p-8 text-white ${isRejected ? 'bg-slate-500' : isClosed ? 'bg-emerald-600' : 'bg-slate-900'}`}>
            <div className="flex justify-between items-start">
              <div>
                <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-bold">TICKET #{ticket.id}</span>
                <h1 className="text-3xl font-black mt-2">{ticket.titre}</h1>
              </div>
              <div className="flex gap-2">
                {isFresh && isStaff && (
                  <>
                    <button onClick={() => onUpdateStatus(String(ticket.id), 2)} className="px-4 py-2 bg-white/10 rounded-xl">Refuser</button>
                    <button onClick={() => onUpdateStatus(String(ticket.id), 3, currentUser.id)} className="px-6 py-2 bg-emerald-500 rounded-xl font-bold">ACCEPTER</button>
                  </>
                )}
              </div>
            </div>
            {isWorkable && isStaff && (
              <div className="mt-6 p-4 bg-black/20 rounded-2xl inline-block">
                <p className="text-xs opacity-70">Temps écoulé</p>
                <p className="text-2xl font-mono font-bold">{formatTime(secondsElapsed)}</p>
              </div>
            )}
          </div>

          <div className="p-8 space-y-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div><p className="text-[10px] font-bold text-slate-400">CLIENT</p><p className="font-bold">{ticket.clientId}</p></div>
              <div>
                <p className="text-[10px] font-bold text-slate-400">STATUT</p>
                <p className={`font-black ${STATUS_MAP[ticket.statut]?.color}`}>{STATUS_MAP[ticket.statut]?.label || ticket.statut}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400">CATÉGORIE</p>
                <p className="font-bold">{CATEGORY_MAP[ticket.categorie] || 'Standard'}</p>
              </div>
              <div><p className="text-[10px] font-bold text-slate-400">CRÉÉ LE</p><p className="font-bold">{new Date(ticket.dateCreation).toLocaleDateString()}</p></div>
            </div>

            <div className="bg-slate-50 p-6 rounded-3xl border-l-8 border-[#ef7c21]">
              <p className="text-[10px] font-bold text-slate-400 mb-2">DESCRIPTION</p>
              <p className="italic text-lg text-slate-700">"{ticket.description}"</p>
            </div>

            {isWorkable && isStaff && (
              <div className="flex gap-4 pt-4 border-t">
                <button onClick={() => setIsPaused(!isPaused)} className={`flex-1 h-16 rounded-2xl font-bold text-white ${isPaused ? 'bg-emerald-500' : 'bg-orange-500'}`}>
                  {isPaused ? 'REPRENDRE' : 'PAUSE'}
                </button>
                <button onClick={() => setShowResolution(true)} className="flex-1 h-16 bg-red-600 text-white rounded-2xl font-bold">TERMINER</button>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* CHAT SIDEBAR */}
      {isChatOpen && (
        <div className="fixed top-0 right-0 h-full w-[400px] bg-white shadow-2xl z-[200] flex flex-col border-l">
          <div className="p-5 bg-slate-900 text-white flex justify-between items-center">
            <span className="font-bold">Chat Support</span>
            <button onClick={() => setIsChatOpen(false)}><X /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {chatMessages.map(msg => (
              <div key={msg.id} className={`flex ${msg.sender === (isStaff ? 'agent' : 'client') ? 'justify-end' : ''}`}>
                <div className={`p-3 rounded-2xl max-w-[80%] ${msg.sender === (isStaff ? 'agent' : 'client') ? 'bg-orange-500 text-white' : 'bg-white shadow-sm'}`}>
                  <p className="text-sm">{msg.text}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t flex gap-2">
            <input value={message} onChange={e => setMessage(e.target.value)} className="flex-1 p-2 bg-slate-100 rounded-xl" placeholder="Message..." />
            <button onClick={handleSendMessage} className="p-2 bg-orange-500 text-white rounded-xl"><Send size={18} /></button>
          </div>
        </div>
      )}

      <button onClick={() => setIsChatOpen(!isChatOpen)} className="fixed bottom-8 right-8 h-16 w-16 bg-orange-500 text-white rounded-2xl shadow-2xl flex items-center justify-center">
        {isChatOpen ? <X /> : <MessageSquare />}
      </button>
    </div>
  );
}