import { useState } from 'react';
import { Card } from '../../../components/ui/Card';
import { interventionService } from '../../../Services/helpdesk/interventionService';
import { CategorieAction, type Intervention } from '../../../types/helpdesk';
import {
  ArrowLeft,
  ChevronRight,
  Layout,
  Wrench,
  Euro,
  Timer,
  Tag,
  Edit2,
  Trash2,
  Save,
  X,
  Loader2,
} from 'lucide-react';

interface InterventionDetailProps {
  intervention: Intervention;
  onBack: () => void;
  onDeleted: (id: number) => void;
  onUpdated: (updated: Intervention) => void;
}

const CATEGORY_LABELS: Record<number, string> = {
  [CategorieAction.HelpDesk]: 'Help Desk',
  [CategorieAction.Developpement]: 'Développement',
  [CategorieAction.Windows]: 'Windows',
};

export function InterventionDetail({ intervention, onBack, onDeleted, onUpdated }: InterventionDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [form, setForm] = useState({
    nom: intervention.nom,
    description: intervention.description ?? '',
    categorie: intervention.categorie,
    prixForfaitaire: intervention.prixForfaitaire,
    dureeEstimeeMinutes: intervention.dureeEstimeeMinutes,
  });

  const handleSave = async () => {
    if (isSubmitting) return;
    try {
      setIsSubmitting(true);
      const updated: Intervention = {
        ...intervention,
        nom: form.nom,
        description: form.description || undefined,
        categorie: form.categorie,
        prixForfaitaire: Number(form.prixForfaitaire) || 0,
        dureeEstimeeMinutes: Number(form.dureeEstimeeMinutes) || 0,
      };
      await interventionService.update(intervention.id, updated);
      onUpdated(updated);
      setIsEditing(false);
    } catch (error) {
      console.error('Erreur mise à jour intervention:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Supprimer l'intervention « ${intervention.nom} » ?`)) return;
    try {
      setIsDeleting(true);
      await interventionService.delete(intervention.id);
      onDeleted(intervention.id);
    } catch (error) {
      console.error('Erreur suppression intervention:', error);
      setIsDeleting(false);
    }
  };

  const categoryName = CATEGORY_LABELS[intervention.categorie] ?? 'Autre';

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      {/* Navigation & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="h-10 w-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-[#ef7c21] transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
              <span>Interventions</span>
              <ChevronRight size={10} />
              <span className="text-[#ef7c21]">{categoryName}</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900">{intervention.nom}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:border-[#ef7c21]/30 hover:text-[#ef7c21] font-black text-[10px] uppercase tracking-widest shadow-sm transition-all"
              >
                <Edit2 size={14} /> Modifier
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-red-50 text-red-500 hover:bg-red-100 font-black text-[10px] uppercase tracking-widest transition-all disabled:opacity-50"
              >
                {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                Supprimer
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setForm({
                    nom: intervention.nom,
                    description: intervention.description ?? '',
                    categorie: intervention.categorie,
                    prixForfaitaire: intervention.prixForfaitaire,
                    dureeEstimeeMinutes: intervention.dureeEstimeeMinutes,
                  });
                }}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-100 text-slate-500 hover:bg-slate-200 font-black text-[10px] uppercase tracking-widest"
              >
                <X size={14} /> Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={isSubmitting || !form.nom.trim()}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#ef7c21] hover:bg-[#d96a1a] text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-orange-100 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Enregistrer
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-8">
          {/* Contexte / Description */}
          <section className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
              <Layout size={14} /> Description de la prestation
            </h3>

            {!isEditing ? (
              <p className="text-slate-600 text-lg leading-relaxed font-medium">
                {intervention.description ?? (
                  <span className="italic text-slate-300">Aucune description fournie.</span>
                )}
              </p>
            ) : (
              <Card className="p-6 border-2 border-dashed border-[#ef7c21]/30 bg-[#ef7c21]/5 space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#ef7c21]">
                    Nom de l'intervention
                  </label>
                  <input
                    type="text"
                    className="w-full px-5 py-4 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-orange-100 font-medium bg-white"
                    value={form.nom}
                    onChange={(e) => setForm({ ...form, nom: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#ef7c21]">
                    Description
                  </label>
                  <textarea
                    rows={5}
                    className="w-full px-5 py-4 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-orange-100 font-medium resize-none bg-white"
                    placeholder="Décrire la prestation, les livrables, les prérequis..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#ef7c21]">
                      Catégorie
                    </label>
                    <select
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-[#ef7c21]/20 font-medium bg-white"
                      value={form.categorie}
                      onChange={(e) => setForm({ ...form, categorie: Number(e.target.value) as CategorieAction })}
                    >
                      <option value={CategorieAction.HelpDesk}>Help Desk</option>
                      <option value={CategorieAction.Windows}>Windows</option>
                      <option value={CategorieAction.Developpement}>Développement</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#ef7c21]">
                      Prix (€)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-[#ef7c21]/20 font-medium bg-white"
                      value={form.prixForfaitaire}
                      onChange={(e) => setForm({ ...form, prixForfaitaire: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#ef7c21]">
                      Durée (min)
                    </label>
                    <input
                      type="number"
                      min="1"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-[#ef7c21]/20 font-medium bg-white"
                      value={form.dureeEstimeeMinutes}
                      onChange={(e) => setForm({ ...form, dureeEstimeeMinutes: Number(e.target.value) })}
                    />
                  </div>
                </div>
              </Card>
            )}
          </section>

          {/* Bloc Caractéristiques */}
          <div className="space-y-6">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2 mb-8">
              <Wrench size={14} /> Caractéristiques
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center text-[#ef7c21]">
                    <Euro size={18} />
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Prix forfaitaire</p>
                </div>
                <p className="text-3xl font-black text-slate-900">
                  {intervention.prixForfaitaire.toFixed(2)} <span className="text-lg text-slate-400">€</span>
                </p>
              </Card>

              <Card className="p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                    <Timer size={18} />
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Durée estimée</p>
                </div>
                <p className="text-3xl font-black text-slate-900">
                  {intervention.dureeEstimeeMinutes} <span className="text-lg text-slate-400">min</span>
                </p>
              </Card>

              <Card className="p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500">
                    <Tag size={18} />
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Catégorie</p>
                </div>
                <p className="text-2xl font-black text-slate-900">{categoryName}</p>
              </Card>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="p-6 bg-slate-900 text-white border-none shadow-2xl">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-8">Informations</h4>
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-[#ef7c21]">
                  <Wrench size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase opacity-40">Type</p>
                  <p className="text-sm font-bold">Prestation forfaitaire</p>
                </div>
              </div>
              <div className="pt-6 border-t border-white/10">
                <div className="p-4 rounded-2xl bg-white/5">
                  <p className="text-[10px] font-black uppercase opacity-40">Ref</p>
                  <p className="text-lg font-black tracking-widest text-[#ef7c21]">#INT-{intervention.id}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
