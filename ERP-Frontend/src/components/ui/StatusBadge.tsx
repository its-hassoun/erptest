import { StatutTicket } from '../../types/helpdesk';

interface StatusBadgeProps {
  status: number | string; // Accepte l'ID (0, 1...) ou le texte
  className?: string;
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  
  const getStatusConfig = (s: number | string) => {
    // On convertit tout en string pour le switch
    const value = String(s).toLowerCase();

    switch (value) {
      case '0':
      case 'nouveau':
      case 'fresh':
        return { label: 'Nouveau', styles: 'bg-cyan-100 text-cyan-800 border-cyan-200' };
      case '1':
      case 'enattente':
      case 'pending':
        return { label: 'En Attente', styles: 'bg-amber-100 text-amber-800 border-amber-200' };
      case '2':
      case 'rejete':
      case 'rejected':
        return { label: 'Rejeté', styles: 'bg-red-100 text-red-800 border-red-200' };
      case '3':
      case 'ouvert':
      case 'open':
        return { label: 'Ouvert', styles: 'bg-blue-100 text-blue-800 border-blue-200' };
      case '4':
      case 'enpause':
      case 'paused':
        return { label: 'En Pause', styles: 'bg-purple-100 text-purple-800 border-purple-200' };
      case '5':
      case 'clos':
      case 'closed':
        return { label: 'Clos', styles: 'bg-green-100 text-green-800 border-green-200' };
      default:
        return { label: String(status), styles: 'bg-slate-100 text-slate-800 border-slate-200' };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.styles} ${className}`}
    >
      {config.label}
    </span>
  );
}