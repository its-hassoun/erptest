import { ArrowUpIcon, ArrowRightIcon, ArrowDownIcon, AlertCircle } from 'lucide-react';
import { PrioriteTicket } from '../../types/helpdesk';

interface PriorityIndicatorProps {
  // On accepte le type numérique de ton enum ou une string pour la rétrocompatibilité
  priority: PrioriteTicket | string | number;
}

export function PriorityIndicator({ priority }: PriorityIndicatorProps) {
  // On convertit en string pour un switch robuste
  const p = String(priority).toLowerCase();

  switch (p) {
    case '3':
    case 'critical':
    case 'critique':
      return (
        <div className="flex items-center text-red-700 font-bold" title="Critique">
          <AlertCircle className="h-4 w-4 mr-1" />
          <span className="text-xs">Critique</span>
        </div>
      );
    case '2':
    case 'high':
    case 'haute':
      return (
        <div className="flex items-center text-red-600" title="Haute">
          <ArrowUpIcon className="h-4 w-4 mr-1" />
          <span className="text-xs font-medium">Haute</span>
        </div>
      );
    case '1':
    case 'medium':
    case 'moyenne':
      return (
        <div className="flex items-center text-orange-500" title="Moyenne">
          <ArrowRightIcon className="h-4 w-4 mr-1" />
          <span className="text-xs font-medium">Moyenne</span>
        </div>
      );
    case '0':
    case 'low':
    case 'basse':
      return (
        <div className="flex items-center text-blue-500" title="Basse">
          <ArrowDownIcon className="h-4 w-4 mr-1" />
          <span className="text-xs font-medium">Basse</span>
        </div>
      );
    default:
      // Optionnel : afficher la valeur brute si on ne la reconnaît pas pour aider au debug
      return <span className="text-xs text-slate-400">Prio: {priority}</span>;
  }
}