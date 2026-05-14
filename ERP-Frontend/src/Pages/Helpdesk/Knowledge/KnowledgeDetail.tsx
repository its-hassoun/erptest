import { useState } from 'react';
import { Card } from '../../../components/ui/Card';
import { CategorieAction } from '../../../types/helpdesk';
import { knowledgeSolutionService } from '../../../Services/helpdesk/knowledgeService'; 
import type { KnowledgeBase, KnowledgeSolution } from '../../../types/helpdesk';
import {
  ArrowLeft,
  Calendar,
  User as UserIcon,
  Lightbulb,
  Plus,
  X,
  FileText,
  Paperclip,
  MessageSquare,
  ChevronRight,
  Download,
  Clock,
  Layout,
  Loader2
} from 'lucide-react';

interface KnowledgeDetailProps {
  article: KnowledgeBase;
  onBack: () => void;
}

export function KnowledgeDetail({ article: initialArticle, onBack }: KnowledgeDetailProps) {
  const [article, setArticle] = useState<KnowledgeBase>(initialArticle);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // States pour le formulaire
  const [newDescription, setNewDescription] = useState('');

  const handleAddSolution = async () => {
    if (!newDescription.trim()) return;

    try {
      setIsSubmitting(true);
      
      // Préparation de l'objet pour le service (Omit id et dateResolution)
      const solutionData = {
        descriptionResolution: newDescription,
        agentId: 1, // À remplacer par l'ID de l'utilisateur connecté
        knowledgeBaseId: article.id,
        piecesJointesUrls: [] // Logique d'upload à implémenter ici plus tard
      };

      const createdSolution = await knowledgeSolutionService.add(solutionData);

      // Mise à jour de l'état local avec la réponse du serveur
      setArticle({ 
        ...article, 
        solutions: [createdSolution, ...article.solutions] 
      });

      setNewDescription('');
      setShowAddForm(false);
    } catch (error) {
      console.error("Erreur lors de l'ajout de la solution:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoryName = Object.keys(CategorieAction).find(
    (k) => (CategorieAction as any)[k] === article.categorie
  );

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
              <span>Knowledge Base</span>
              <ChevronRight size={10} />
              <span className="text-[#ef7c21]">{categoryName}</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900">{article.nomErreur}</h1>
          </div>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          disabled={isSubmitting}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg ${
            showAddForm ? 'bg-slate-100 text-slate-500' : 'bg-[#ef7c21] text-white hover:bg-[#d96a1a]'
          }`}
        >
          {showAddForm ? <X size={16} /> : <Plus size={16} />}
          {showAddForm ? 'Annuler' : 'Ajouter une solution'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-8">
          {/* Contexte */}
          <section className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
              <Layout size={14} /> Symptômes & Contexte
            </h3>
            <p className="text-slate-600 text-lg leading-relaxed font-medium">
              {article.descriptionErreur}
            </p>
          </section>

          {/* Formulaire */}
          {showAddForm && (
            <Card className="p-8 border-2 border-dashed border-[#ef7c21]/30 bg-[#ef7c21]/5 animate-in zoom-in-95">
              <div className="flex items-center gap-2 text-[#ef7c21] mb-6">
                <Lightbulb size={20} className="fill-current" />
                <h4 className="text-sm font-black uppercase tracking-widest">Nouvelle Résolution</h4>
              </div>
              <textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                disabled={isSubmitting}
                rows={5}
                className="w-full px-5 py-4 rounded-2xl border border-slate-200 outline-none font-medium resize-none mb-4 focus:ring-4 focus:ring-orange-100"
                placeholder="Expliquez comment résoudre ce problème..."
              />
              <div className="flex justify-end">
                <button
                  onClick={handleAddSolution}
                  disabled={isSubmitting || !newDescription.trim()}
                  className="px-10 py-3.5 bg-[#ef7c21] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#d96a1a] shadow-lg disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 size={14} className="animate-spin" />}
                  Publier la solution
                </button>
              </div>
            </Card>
          )}

          {/* Liste des solutions */}
          <div className="space-y-6">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2 mb-8">
              <MessageSquare size={14} /> Solutions Documentées ({article.solutions.length})
            </h3>

            {article.solutions.map((sol, idx) => (
              <div key={sol.id} className="relative pl-12 before:absolute before:left-0 before:top-4 before:bottom-0 before:w-px before:bg-slate-200">
                <div className="absolute left-[-6px] top-4 h-3 w-3 rounded-full bg-white border-2 border-[#ef7c21]" />
                <Card className="p-8 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">
                        AG
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900">Agent #{sol.agentId}</p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase">
                          <Clock size={10} /> {new Date(sol.dateResolution).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-slate-700 font-medium leading-relaxed mb-8 whitespace-pre-wrap">
                    {sol.descriptionResolution}
                  </p>

                  {sol.piecesJointesUrls && sol.piecesJointesUrls.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-6 border-t border-slate-50">
                      {sol.piecesJointesUrls.map((url, uIdx) => (
                        <a
                          href={url}
                          key={uIdx}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 group hover:border-[#ef7c21]/30 transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <FileText size={16} className="text-[#ef7c21]" />
                            <span className="text-xs font-bold text-slate-600 truncate max-w-[150px]">
                              Document {uIdx + 1}
                            </span>
                          </div>
                          <Download size={14} className="text-slate-300 group-hover:text-[#ef7c21]" />
                        </a>
                      ))}
                    </div>
                  )}
                </Card>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="p-6 bg-slate-900 text-white border-none shadow-2xl">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-8">Informations</h4>
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-[#ef7c21]">
                  <Calendar size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase opacity-40">Date Création</p>
                  <p className="text-sm font-bold">{new Date(article.dateCreation).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="pt-6 border-t border-white/10">
                <div className="p-4 rounded-2xl bg-white/5">
                  <p className="text-[10px] font-black uppercase opacity-40">Ref KB</p>
                  <p className="text-lg font-black tracking-widest text-[#ef7c21]">#{article.id}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}