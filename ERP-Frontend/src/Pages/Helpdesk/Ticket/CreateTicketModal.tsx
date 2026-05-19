import { useState, useRef, useEffect, useMemo } from 'react';
import { Select } from '../../../components/ui/Select';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { StatutTicket, PrioriteTicket, type Ticket, type Intervention, CategorieAction } from '../../../types/helpdesk';
import type { User } from '../../../types/user';
import { interventionService } from '../../../Services/helpdesk/interventionService';
import { ticketService } from '../../../Services/helpdesk/ticketService';
import { X, Upload, Loader2 } from 'lucide-react';

const CLIENTS_DATA = [
  { id: 900, name: 'Groupe Renault', subClients: [{ id: 1, name: 'Usine Flins' }, { id: 2, name: 'Siège Boulogne' }] },
  { id: 901, name: 'TotalEnergies', subClients: [{ id: 3, name: 'Raffinage France' }, { id: 4, name: 'Secteur IT' }] }
];

const priorityMap: Record<string, number> = { 'low': 0, 'medium': 1, 'high': 2 };

export function CreateTicketModal({ isOpen, onClose, onSubmit, currentUser }: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSubmit: (ticket: Ticket) => void; 
  currentUser: User 
}) {
  const [formData, setFormData] = useState({
    clientId: '',
    subClientId: '',
    interventionId: '',
    customTitle: '',
    priority: 'medium',
    categorie: '0',
    description: ''
  });

  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAdminOrAgent = currentUser.role === 'Admin' || currentUser.role === 'agent';

  useEffect(() => {
    if (isOpen) {
      interventionService.getAll().then(setInterventions).catch(console.error);
    }
  }, [isOpen]);

  const availableSubClients = useMemo(() => {
    const client = CLIENTS_DATA.find(c => String(c.id) === formData.clientId);
    return client?.subClients || [];
  }, [formData.clientId]);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);

  try {
    const selectedInt = interventions.find(i => String(i.id) === formData.interventionId);
    const data = new FormData();

    // --- DONNÉES TEXTUELLES ---
    data.append('Titre', formData.interventionId === 'other' ? formData.customTitle : (selectedInt?.nom || 'Intervention'));
    data.append('Description', formData.description || "");

    // --- ENUMS ET NOMBRES (Toujours en string) ---
    data.append('Statut', '0'); // Nouveau
    data.append('Priorite', (priorityMap[formData.priority] ?? 1).toString());
    data.append('Categorie', formData.categorie.toString());
    
    // Identifiants
    data.append('ClientId', (formData.clientId || currentUser.id).toString());
    data.append('AgentPrincipalId', currentUser.id.toString());
    
    if (formData.interventionId && formData.interventionId !== 'other') {
      data.append('InterventionId', formData.interventionId);
    }

    // Champs techniques requis par le modèle
    data.append('DateCreation', new Date().toISOString());
    data.append('DureeReelleMinutes', '0');
    data.append('CoutFinal', '0');

    // --- FICHIERS ---
    if (files.length > 0) {
      files.forEach((file) => {
        data.append('files', file); 
      });
    }

    // DEBUG : Vérifier le contenu avant envoi
    for (let [key, value] of data.entries()) {
      console.log(`${key}:`, value);
    }

    const createdTicket = await ticketService.create(data);
    
    onSubmit(createdTicket);
    onClose();
    setFiles([]); // Reset
  } catch (err: any) {
    console.error("Détails de l'erreur:", err.response?.data?.errors);
    alert("Erreur lors de la création du ticket. Vérifiez la console.");
  } finally {
    setIsSubmitting(false);
  }
};

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-xl font-black text-slate-900">Nouveau Ticket</h2>
            <p className="text-[10px] text-[#ef7c21] font-bold uppercase tracking-widest">
              Émetteur : {currentUser.name} ({currentUser.role})
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          <form id="create-ticket-form" onSubmit={handleSubmit} className="space-y-6">
            
            {isAdminOrAgent && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <Select
                  label="Client"
                  required
                  options={[
                    { value: '', label: 'Sélectionner un client...' },
                    ...CLIENTS_DATA.map(c => ({ value: String(c.id), label: c.name }))
                  ]}
                  value={formData.clientId}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value, subClientId: '' })}
                />
                <Select
                  label="Site / Sous-compte"
                  disabled={!formData.clientId || availableSubClients.length === 0}
                  options={[
                    { value: '', label: 'Siège Principal' },
                    ...availableSubClients.map(s => ({ value: String(s.id), label: s.name }))
                  ]}
                  value={formData.subClientId}
                  onChange={(e) => setFormData({ ...formData, subClientId: e.target.value })}
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Nature de l'intervention"
                required
                options={[
                  { value: '', label: 'Choisir...' },
                  ...interventions.map(i => ({ value: String(i.id), label: i.nom })),
                  { value: 'other', label: 'Autre (Saisie manuelle)' }
                ]}
                value={formData.interventionId}
                onChange={(e) => {
                  const selected = interventions.find(i => String(i.id) === e.target.value);
                  setFormData({ 
                    ...formData, 
                    interventionId: e.target.value, 
                    description: selected ? (selected.description || '') : formData.description 
                  });
                }}
              />
              <Select
                label="Priorité"
                options={[
                  { value: 'low', label: 'Basse' },
                  { value: 'medium', label: 'Moyenne' },
                  { value: 'high', label: 'Haute' }
                ]}
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              />
            </div>

            {formData.interventionId === 'other' && (
              <Input 
                label="Objet du ticket" 
                placeholder="Ex: Problème d'accès serveur..."
                required 
                value={formData.customTitle} 
                onChange={(e) => setFormData({ ...formData, customTitle: e.target.value })} 
              />
            )}

            <Select
              label="Catégorie"
              required
              options={[
                { value: '0', label: 'Helpdesk / Support' },
                { value: '1', label: 'Développement / Bug' },
                { value: '2', label: 'Infrastructure / Réseau' }
              ]}
              value={formData.categorie}
              onChange={(e) => setFormData({ ...formData, categorie: e.target.value })}
            />

            <div>
              <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-[0.2em]">
                Description détaillée
              </label>
              <textarea
                className="w-full rounded-2xl border border-slate-200 p-4 min-h-[140px] focus:ring-2 focus:ring-orange-500/20 focus:border-[#ef7c21] outline-none bg-slate-50 text-sm transition-all"
                required
                placeholder="Décrivez votre problème ici..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {/* Pièces Jointes */}
            <div className="space-y-3">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Documents (Optionnel)</label>
              <div 
                onClick={() => fileInputRef.current?.click()} 
                className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center bg-slate-50 hover:bg-orange-50 hover:border-orange-200 cursor-pointer transition-all group"
              >
                <input 
                  type="file" 
                  multiple 
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={(e) => e.target.files && setFiles([...files, ...Array.from(e.target.files)])} 
                />
                <Upload className="text-slate-400 group-hover:text-[#ef7c21] h-8 w-8 mb-2 transition-colors" />
                <p className="text-xs font-bold text-slate-500 group-hover:text-slate-700">Glissez vos fichiers ou cliquez pour parcourir</p>
              </div>
              
              {files.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {files.map((file, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-2 bg-orange-50 border border-orange-100 rounded-xl text-[10px] font-bold text-orange-700 animate-in fade-in zoom-in duration-200">
                      <span className="max-w-[150px] truncate">{file.name}</span>
                      <button type="button" onClick={() => setFiles(files.filter((_, idx) => idx !== i))}>
                        <X className="h-3 w-3 hover:text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t flex justify-end gap-3 bg-white rounded-b-3xl shrink-0">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting} className="rounded-xl font-bold">
            Annuler
          </Button>
          <Button 
            type="submit" 
            form="create-ticket-form" 
            disabled={isSubmitting} 
            className="bg-[#ef7c21] hover:bg-orange-600 text-white rounded-xl px-10 font-black min-w-[180px] shadow-lg shadow-orange-500/20 transition-all active:scale-95"
          >
            {isSubmitting ? <Loader2 className="animate-spin h-5 w-5" /> : 'Ouvrir le ticket'}
          </Button>
        </div>
      </div>
    </div>
  );
}