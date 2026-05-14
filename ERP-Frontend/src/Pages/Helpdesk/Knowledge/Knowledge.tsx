import { useMemo, useState, useEffect } from 'react';
import { Card } from '../../../components/ui/Card';
import { KnowledgeDetail } from './KnowledgeDetail';
import { knowledgeService } from '../../../Services/helpdesk/knowledgeService';
import { CategorieAction } from '../../../types/helpdesk';
import type { KnowledgeBase } from '../../../types/helpdesk';
import {
  BookOpen, Layers, Users, Search, Calendar, ChevronDown, Plus, X, CheckCircle2, Loader2, Upload, FileText
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';

export function Knowledge() {
  // --- ÉTATS ---
  const [articles, setArticles] = useState<KnowledgeBase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticleId, setSelectedArticleId] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('Toutes');
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  
  // État du formulaire avec la solution et ses fichiers intégrés
  const [formData, setFormData] = useState({
    nomErreur: '',
    descriptionErreur: '',
    categorie: CategorieAction.HelpDesk as CategorieAction,
    initialSolution: {
      contenu: '',
      agentId: 1, 
      files: [] as File[] // Les fichiers sont ici, dans la solution
    }
  });

  // --- CHARGEMENT DES DONNÉES ---
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setIsLoading(true);
        const data = await knowledgeService.getAll();
        setArticles(data);
      } catch (error) {
        console.error("Erreur KB:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchArticles();
  }, []);

  // --- CALCULS DYNAMIQUES (Stats image_86cdc1.png) ---
  const stats = useMemo(() => {
    const uniqueContributors = new Set(
      articles.flatMap(a => a.solutions?.map(s => s.agentId) || [])
    );
    const sectorsCount = Object.keys(CategorieAction).filter(k => isNaN(Number(k))).length;

    return {
      articles: articles.length,
      sectors: sectorsCount,
      contributors: uniqueContributors.size
    };
  }, [articles]);

  // --- FILTRAGE ---
  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      const matchesSearch =
        article.nomErreur.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.descriptionErreur.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = 
        activeCategory === 'Toutes' || 
        article.categorie.toString() === activeCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory, articles]);

  // --- GESTIONNAIRES ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData({
        ...formData,
        initialSolution: {
          ...formData.initialSolution,
          files: Array.from(e.target.files)
        }
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // On envoie le bloc complet au service
      const created = await knowledgeService.create(formData);
      
      setArticles(prev => [created, ...prev]);
      setIsArticleModalOpen(false);
      setFormData({
        nomErreur: '',
        descriptionErreur: '',
        categorie: CategorieAction.HelpDesk,
        initialSolution: { contenu: '', agentId: 1, files: [] }
      });
    } catch (error) {
      console.error("Erreur creation:", error);
    }
  };

  if (isLoading) return <div className="h-96 flex items-center justify-center"><Loader2 className="animate-spin text-[#ef7c21]" /></div>;

  if (selectedArticleId) {
    const art = articles.find(a => a.id === selectedArticleId);
    if (art) return <KnowledgeDetail article={art} onBack={() => setSelectedArticleId(null)} />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* MODAL DE CRÉATION */}
      {isArticleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-8 border-b sticky top-0 bg-white z-10 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-slate-900">Nouvel Article</h2>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Saisie Problème & Solution</p>
              </div>
              <button onClick={() => setIsArticleModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full">
                <X size={20} />
              </button>
            </div>

            <form className="p-8 space-y-6" onSubmit={handleSubmit}>
              {/* SECTION BASE (PROBLÈME) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nom de l'article</label>
                  <input required type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-[#ef7c21]/20 font-medium" placeholder="Titre..." value={formData.nomErreur} onChange={e => setFormData({...formData, nomErreur: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Catégorie</label>
                  <select className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-[#ef7c21]/20 font-medium bg-white" value={formData.categorie} onChange={e => setFormData({...formData, categorie: Number(e.target.value) as CategorieAction})}>
                    <option value={CategorieAction.HelpDesk}>Help Desk</option>
                    <option value={CategorieAction.Windows}>Windows</option>
                    <option value={CategorieAction.Developpement}>Développement</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Description du problème</label>
                <input required type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-[#ef7c21]/20 font-medium" placeholder="Résumé..." value={formData.descriptionErreur} onChange={e => setFormData({...formData, descriptionErreur: e.target.value})} />
              </div>

              {/* SECTION SOLUTION (DÉTAILS) */}
              <div className="p-6 bg-slate-50 rounded-[2rem] space-y-4 border border-slate-100">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#ef7c21]">Première Solution (Obligatoire)</label>
                  <textarea required rows={4} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-[#ef7c21]/20 font-medium resize-none bg-white" placeholder="Détails de la résolution..." value={formData.initialSolution.contenu} onChange={e => setFormData({...formData, initialSolution: { ...formData.initialSolution, contenu: e.target.value }})} />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pièces jointes de la solution</label>
                  <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center group cursor-pointer relative bg-white hover:border-[#ef7c21]/40 transition-colors">
                    <input type="file" multiple className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileChange} />
                    <Upload className="mx-auto h-8 w-8 text-slate-300 group-hover:text-[#ef7c21] mb-2" />
                    <p className="text-xs font-bold text-slate-500">
                      {formData.initialSolution.files.length > 0 ? `${formData.initialSolution.files.length} fichier(s) prêt(s)` : "Ajouter des justificatifs (PDF, Images...)"}
                    </p>
                  </div>
                  {formData.initialSolution.files.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.initialSolution.files.map((f, i) => (
                        <div key={i} className="flex items-center gap-2 px-3 py-1 bg-white rounded-lg border border-slate-100 text-[10px] font-bold text-slate-600 shadow-sm">
                          <FileText size={12} className="text-[#ef7c21]" /> {f.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsArticleModalOpen(false)} className="flex-1 py-4 rounded-xl font-black text-xs uppercase text-slate-500 bg-slate-100 hover:bg-slate-200">Annuler</button>
                <button type="submit" className="flex-[2] py-4 rounded-xl font-black text-xs uppercase text-white bg-[#ef7c21] hover:bg-[#d96a1a] shadow-lg shadow-orange-100">Créer l'article & sa solution</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* HEADER & STATS (Design image_86cdc1.png) */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Knowledge Base</h1>
          <p className="text-slate-500 font-medium mt-1">Exploitez le savoir-faire technique partagé par l'équipe</p>
        </div>
        <button onClick={() => setIsArticleModalOpen(true)} className="bg-[#ef7c21] text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-[#d96a1a] shadow-lg shadow-orange-100 transition-transform active:scale-95">
          <Plus size={18} /> Nouvel Article
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#ef7c21] p-8 rounded-[2.5rem] text-white relative overflow-hidden group">
          <div className="relative z-10">
            <BookOpen className="mb-4 opacity-80" size={32} />
            <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Articles</p>
            <p className="text-5xl font-black mt-1">{stats.articles}</p>
          </div>
          <BookOpen className="absolute -right-8 -bottom-8 w-48 h-48 opacity-10 group-hover:scale-110 transition-transform duration-700" />
        </div>
        <div className="bg-[#2563eb] p-8 rounded-[2.5rem] text-white relative overflow-hidden group">
          <div className="relative z-10">
            <Layers className="mb-4 opacity-80" size={32} />
            <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Secteurs</p>
            <p className="text-5xl font-black mt-1">{stats.sectors}</p>
          </div>
          <Layers className="absolute -right-8 -bottom-8 w-48 h-48 opacity-10 group-hover:scale-110 transition-transform duration-700" />
        </div>
        <div className="bg-[#00c851] p-8 rounded-[2.5rem] text-white relative overflow-hidden group">
          <div className="relative z-10">
            <Users className="mb-4 opacity-80" size={32} />
            <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Contributeurs</p>
            <p className="text-5xl font-black mt-1">{stats.contributors}</p>
          </div>
          <Users className="absolute -right-8 -bottom-8 w-48 h-48 opacity-10 group-hover:scale-110 transition-transform duration-700" />
        </div>
      </div>

      {/* RECHERCHE ET LISTE */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input type="text" placeholder="Rechercher..." className="w-full pl-14 pr-4 py-5 bg-white border border-slate-100 rounded-[1.25rem] focus:ring-4 focus:ring-[#ef7c21]/10 outline-none font-medium shadow-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <div className="relative">
          <select className="appearance-none pl-12 pr-14 py-5 bg-white border border-slate-100 rounded-[1.25rem] font-bold text-slate-700 outline-none cursor-pointer shadow-sm min-w-[240px]" value={activeCategory} onChange={(e) => setActiveCategory(e.target.value)}>
            <option value="Toutes">Tous les services</option>
            <option value={CategorieAction.HelpDesk.toString()}>Help Desk</option>
            <option value={CategorieAction.Windows.toString()}>Windows</option>
            <option value={CategorieAction.Developpement.toString()}>Développement</option>
          </select>
          <Layers className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
          <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filteredArticles.map((article) => (
          <Card key={article.id} className="group hover:border-[#ef7c21]/40 transition-all shadow-sm cursor-pointer border-transparent" noPadding onClick={() => setSelectedArticleId(article.id)}>
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-orange-50 flex items-center justify-center text-[#ef7c21] group-hover:bg-[#ef7c21] group-hover:text-white transition-all duration-300">
                    <BookOpen size={28} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 group-hover:text-[#ef7c21] transition-colors">{article.nomErreur}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-3 py-1 rounded-lg bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-wider">
                        {(CategorieAction as any)[article.categorie]}
                      </span>
                    </div>
                  </div>
                </div>
                <span className="text-sm font-black text-slate-300 bg-slate-50 px-3 py-1 rounded-lg">#KB-{article.id}</span>
              </div>
              <p className="text-slate-500 font-medium mb-8 line-clamp-2 leading-relaxed text-lg">{article.descriptionErreur}</p>
              <div className="flex flex-wrap gap-6 items-center justify-between pt-6 border-t border-slate-50">
                <div className="flex items-center gap-2 text-slate-400 font-bold text-sm">
                    <Calendar size={16} className="text-slate-300" /> 
                    {new Date(article.dateCreation).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                </div>
                <div className="flex items-center gap-2 text-[#00b341] bg-green-50 px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-tight">
                  <CheckCircle2 size={16} /> {article.solutions?.length || 0} solutions
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}