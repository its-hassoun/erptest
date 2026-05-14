import { useEffect, useMemo, useState } from 'react';
import { Card } from '../../../components/ui/Card';
import { InterventionDetail } from './InterventionDetail';
import { interventionService } from '../../../Services/helpdesk/interventionService';
import { CategorieAction, type Intervention } from '../../../types/helpdesk';
import {
  Wrench,
  Layers,
  Clock,
  Search,
  ChevronDown,
  Plus,
  X,
  Tag,
  Loader2,
  Euro,
  Timer,
} from 'lucide-react';

const CATEGORY_LABELS: Record<number, string> = {
  [CategorieAction.HelpDesk]: 'Help Desk',
  [CategorieAction.Developpement]: 'Développement',
  [CategorieAction.Windows]: 'Windows',
};

export function Intervention() {
  // --- ÉTATS ---
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('Toutes');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<{
    nom: string;
    description: string;
    categorie: CategorieAction;
    prixForfaitaire: number;
    dureeEstimeeMinutes: number;
  }>({
    nom: '',
    description: '',
    categorie: CategorieAction.HelpDesk,
    prixForfaitaire: 0,
    dureeEstimeeMinutes: 60,
  });

  // --- CHARGEMENT ---
  const fetchInterventions = async () => {
    try {
      setIsLoading(true);
      setLoadError(false);
      const data = await interventionService.getAll();
      setInterventions(data);
    } catch (error) {
      console.error('Erreur Interventions:', error);
      setLoadError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInterventions();
  }, []);

  // --- STATS ---
  const stats = useMemo(() => {
    const categoriesCount = Object.keys(CategorieAction).filter(k => isNaN(Number(k))).length;
    const totalDuration = interventions.reduce((acc, i) => acc + (i.dureeEstimeeMinutes || 0), 0);
    return {
      total: interventions.length,
      categories: categoriesCount,
      totalHours: Math.round(totalDuration / 60),
    };
  }, [interventions]);

  // --- FILTRAGE ---
  const filteredInterventions = useMemo(() => {
    return interventions.filter((i) => {
      const matchesSearch =
        i.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (i.description ?? '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        activeCategory === 'Toutes' ||
        i.categorie.toString() === activeCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory, interventions]);

  // --- HANDLERS ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    try {
      setIsSubmitting(true);
      const created = await interventionService.create({
        nom: formData.nom,
        description: formData.description || undefined,
        categorie: formData.categorie,
        prixForfaitaire: Number(formData.prixForfaitaire) || 0,
        dureeEstimeeMinutes: Number(formData.dureeEstimeeMinutes) || 0,
      });
      setInterventions(prev => [created, ...prev]);
      setIsModalOpen(false);
      setFormData({
        nom: '',
        description: '',
        categorie: CategorieAction.HelpDesk,
        prixForfaitaire: 0,
        dureeEstimeeMinutes: 60,
      });
    } catch (error) {
      console.error('Erreur création intervention:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleted = (id: number) => {
    setInterventions(prev => prev.filter(i => i.id !== id));
    setSelectedId(null);
  };

  const handleUpdated = (updated: Intervention) => {
    setInterventions(prev => prev.map(i => (i.id === updated.id ? updated : i)));
  };

  // --- RENDU ---
  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="animate-spin text-[#ef7c21]" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-4">
        <p className="text-slate-500 font-medium">Impossible de charger les interventions.</p>
        <button
          onClick={fetchInterventions}
          className="px-6 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-black text-xs uppercase tracking-widest"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (selectedId) {
    const current = interventions.find(i => i.id === selectedId);
    if (current) {
      return (
        <InterventionDetail
          intervention={current}
          onBack={() => setSelectedId(null)}
          onDeleted={handleDeleted}
          onUpdated={handleUpdated}
        />
      );
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* MODAL DE CRÉATION */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-8 border-b sticky top-0 bg-white z-10 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-slate-900">Nouvelle Intervention</h2>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
                  Catalogue de prestations
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full">
                <X size={20} />
              </button>
            </div>

            <form className="p-8 space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Nom de l'intervention
                  </label>
                  <input
                    required
                    type="text"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-[#ef7c21]/20 font-medium"
                    placeholder="Ex: Installation Windows..."
                    value={formData.nom}
                    onChange={e => setFormData({ ...formData, nom: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Catégorie
                  </label>
                  <select
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-[#ef7c21]/20 font-medium bg-white"
                    value={formData.categorie}
                    onChange={e => setFormData({ ...formData, categorie: Number(e.target.value) as CategorieAction })}
                  >
                    <option value={CategorieAction.HelpDesk}>Help Desk</option>
                    <option value={CategorieAction.Windows}>Windows</option>
                    <option value={CategorieAction.Developpement}>Développement</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Description
                </label>
                <textarea
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-[#ef7c21]/20 font-medium resize-none"
                  placeholder="Détails de la prestation..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Prix forfaitaire (€)
                  </label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-[#ef7c21]/20 font-medium"
                    value={formData.prixForfaitaire}
                    onChange={e => setFormData({ ...formData, prixForfaitaire: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Durée estimée (minutes)
                  </label>
                  <input
                    required
                    type="number"
                    min="1"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-[#ef7c21]/20 font-medium"
                    value={formData.dureeEstimeeMinutes}
                    onChange={e => setFormData({ ...formData, dureeEstimeeMinutes: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 rounded-xl font-black text-xs uppercase text-slate-500 bg-slate-100 hover:bg-slate-200"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-[2] py-4 rounded-xl font-black text-xs uppercase text-white bg-[#ef7c21] hover:bg-[#d96a1a] shadow-lg shadow-orange-100 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting && <Loader2 size={14} className="animate-spin" />}
                  Créer l'intervention
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* HEADER & STATS */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Interventions</h1>
          <p className="text-slate-500 font-medium mt-1">
            Catalogue des prestations forfaitaires proposées au client
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#ef7c21] text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-[#d96a1a] shadow-lg shadow-orange-100 transition-transform active:scale-95"
        >
          <Plus size={18} /> Nouvelle Intervention
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#ef7c21] p-8 rounded-[2.5rem] text-white relative overflow-hidden group">
          <div className="relative z-10">
            <Wrench className="mb-4 opacity-80" size={32} />
            <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Interventions</p>
            <p className="text-5xl font-black mt-1">{stats.total}</p>
          </div>
          <Wrench className="absolute -right-8 -bottom-8 w-48 h-48 opacity-10 group-hover:scale-110 transition-transform duration-700" />
        </div>
        <div className="bg-[#2563eb] p-8 rounded-[2.5rem] text-white relative overflow-hidden group">
          <div className="relative z-10">
            <Layers className="mb-4 opacity-80" size={32} />
            <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Catégories</p>
            <p className="text-5xl font-black mt-1">{stats.categories}</p>
          </div>
          <Layers className="absolute -right-8 -bottom-8 w-48 h-48 opacity-10 group-hover:scale-110 transition-transform duration-700" />
        </div>
        <div className="bg-[#00c851] p-8 rounded-[2.5rem] text-white relative overflow-hidden group">
          <div className="relative z-10">
            <Clock className="mb-4 opacity-80" size={32} />
            <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Heures cumulées (est.)</p>
            <p className="text-5xl font-black mt-1">{stats.totalHours}</p>
          </div>
          <Clock className="absolute -right-8 -bottom-8 w-48 h-48 opacity-10 group-hover:scale-110 transition-transform duration-700" />
        </div>
      </div>

      {/* RECHERCHE ET FILTRE */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher une intervention..."
            className="w-full pl-14 pr-4 py-5 bg-white border border-slate-100 rounded-[1.25rem] focus:ring-4 focus:ring-[#ef7c21]/10 outline-none font-medium shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="relative">
          <select
            className="appearance-none pl-12 pr-14 py-5 bg-white border border-slate-100 rounded-[1.25rem] font-bold text-slate-700 outline-none cursor-pointer shadow-sm min-w-[240px]"
            value={activeCategory}
            onChange={(e) => setActiveCategory(e.target.value)}
          >
            <option value="Toutes">Toutes les catégories</option>
            <option value={CategorieAction.HelpDesk.toString()}>Help Desk</option>
            <option value={CategorieAction.Windows.toString()}>Windows</option>
            <option value={CategorieAction.Developpement.toString()}>Développement</option>
          </select>
          <Layers className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
          <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* LISTE */}
      <div className="grid grid-cols-1 gap-6">
        {filteredInterventions.length === 0 ? (
          <Card className="border-dashed border-2 border-slate-100 bg-white shadow-none">
            <div className="py-16 flex flex-col items-center text-center">
              <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 text-slate-300">
                <Wrench size={28} />
              </div>
              <p className="text-sm font-black text-slate-700 uppercase tracking-widest">
                Aucune intervention
              </p>
              <p className="text-xs text-slate-400 mt-2 max-w-sm leading-relaxed">
                {searchQuery || activeCategory !== 'Toutes'
                  ? 'Essayez de modifier la recherche ou les filtres.'
                  : 'Créez votre première intervention pour démarrer le catalogue.'}
              </p>
            </div>
          </Card>
        ) : (
          filteredInterventions.map((intervention) => (
            <Card
              key={intervention.id}
              className="group hover:border-[#ef7c21]/40 transition-all shadow-sm cursor-pointer border-transparent"
              noPadding
              onClick={() => setSelectedId(intervention.id)}
            >
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-orange-50 flex items-center justify-center text-[#ef7c21] group-hover:bg-[#ef7c21] group-hover:text-white transition-all duration-300">
                      <Wrench size={28} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 group-hover:text-[#ef7c21] transition-colors">
                        {intervention.nom}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-3 py-1 rounded-lg bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
                          <Tag size={10} />
                          {CATEGORY_LABELS[intervention.categorie] ?? 'Autre'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="text-sm font-black text-slate-300 bg-slate-50 px-3 py-1 rounded-lg">
                    #INT-{intervention.id}
                  </span>
                </div>
                {intervention.description && (
                  <p className="text-slate-500 font-medium mb-8 line-clamp-2 leading-relaxed text-lg">
                    {intervention.description}
                  </p>
                )}
                <div className="flex flex-wrap gap-6 items-center justify-between pt-6 border-t border-slate-50">
                  <div className="flex items-center gap-2 text-slate-400 font-bold text-sm">
                    <Timer size={16} className="text-slate-300" />
                    {intervention.dureeEstimeeMinutes} min
                  </div>
                  <div className="flex items-center gap-2 text-[#ef7c21] bg-orange-50 px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-tight">
                    <Euro size={16} />
                    {intervention.prixForfaitaire.toFixed(2)}
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
