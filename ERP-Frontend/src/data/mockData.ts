import type { Ticket } from '../types/helpdesk';
import type { Timesheet, Project } from '../types/timesheets';
import type { User } from '../types/user';


export const USERS: User[] = [
  {
    id: 1, 
    name: 'Jean Dupont',
    email: 'jean.dupont@company.com',
    team: 'Support',
    role: 'Admin',
    avatarInitials: 'JD',
    avatarColor: 'bg-blue-500'
  },
  {
    id: 2, // Anciennement 'u2'
    name: 'Marie Curie',
    email: 'marie.curie@company.com',
    team: 'Development',
    role: 'agent',
    avatarInitials: 'MC',
    avatarColor: 'bg-purple-500'
  },
  {
    id: 3, // Anciennement 'u3'
    name: 'Pierre Martin',
    email: 'pierre.martin@company.com',
    team: 'Helpdesk',
    role: 'agent',
    avatarInitials: 'PM',
    avatarColor: 'bg-green-500'
  },
  {
    id: 4, // Anciennement 'u4'
    name: 'Sophie Germain',
    email: 'sophie.germain@company.com',
    team: 'Windows',
    role: 'agent',
    avatarInitials: 'SG',
    avatarColor: 'bg-yellow-500'
  },
  {
    id: 100, // Anciennement 'client-1'
    name: 'Acme Corp',
    email: 'admin@acme.com',
    team: 'Client',
    role: 'client',
    avatarInitials: 'AC',
    avatarColor: 'bg-orange-500'
  },
  {
    id: 101, // Anciennement 'sub-1'
    name: 'Alice Dubois',
    email: 'alice@acme.com',
    team: 'Acme Corp',
    role: 'subclient',
    clientCompanyId: 100, // Référence à l'ID int du client
    avatarInitials: 'AD',
    avatarColor: 'bg-teal-500'
  },
  {
    id: 102, // Anciennement 'sub-2'
    name: 'Bob Martin',
    email: 'bob@acme.com',
    team: 'Acme Corp',
    role: 'subclient',
    clientCompanyId: 100,
    avatarInitials: 'BM',
    avatarColor: 'bg-indigo-500'
  }
];

export const TICKETS: Ticket[] = [];

export const PROJECTS: Project[] = [
  {
    id: 1,
    name: 'Project Alpha',
    tasks: [
      'Frontend Development',
      'Backend API Integration',
      'Code Review',
      'Unit Testing',
      'Bug Fixing',
      'Documentation'
    ]
  },
  {
    id: 2,
    name: 'Project Beta',
    tasks: [
      'UI/UX Design',
      'Database Migration',
      'Performance Optimization',
      'Security Audit',
      'Deployment'
    ]
  },
  {
    id: 3,
    name: 'Project Gamma',
    tasks: [
      'Requirements Gathering',
      'Architecture Design',
      'Prototyping',
      'Client Presentation',
      'Sprint Planning'
    ]
  },
  {
    id: 4,
    name: 'Infrastructure Upgrade',
    tasks: [
      'Server Configuration',
      'Network Setup',
      'Monitoring Setup',
      'Backup Configuration',
      'Load Testing'
    ]
  }
];

export const TIMESHEETS: Timesheet[] = [
  {
    id: 1,
    userId: 1,
    month: 9,
    year: 2023,
    status: 'draft',
    totalHours: 12,
    tasks: [
      {
        id: 'tk-1',
        date: '2023-10-02',
        description: 'Réunion équipe',
        hours: 2,
        type: 'independent'
      },
      {
        id: 'tk-2',
        date: '2023-10-02',
        description: 'Dev Feature A',
        hours: 6,
        type: 'project',
        projectName: 'Project Alpha'
      },
      {
        id: 'tk-3',
        date: '2023-10-03',
        description: 'Code Review',
        hours: 4,
        type: 'project',
        projectName: 'Project Alpha'
      }
    ]
  },
  {
    id: 2,
    userId: 2,
    month: 9,
    year: 2023,
    status: 'submitted',
    totalHours: 160,
    tasks: [
      {
        id: 'tk-4',
        date: '2023-10-01',
        description: 'Full month work',
        hours: 160,
        type: 'project',
        projectName: 'Project Beta'
      }
    ]
  }
];



export interface SubClient {
  id: number;
  name: string;
  email: string; // Correspond au "Email" du Contact C#
}

export interface ClientGroup {
  id: number;
  name: string;
  email: string; // Correspond au "EmailPrincipal" de Company C#
  agentDedieId: number;
  subClients: SubClient[];
}

export const CLIENTS: ClientGroup[] = [
  { 
    id: 900, 
    name: 'Groupe Renault', 
    email: 'contact@renault.com',
    agentDedieId: 2,
    subClients: [
      { id: 1, name: 'Jean Dupont', email: 'j.dupont@renault.com' }, 
      { id: 2, name: 'Marie Leroy', email: 'm.leroy@renault.com' }
    ] 
  },
  { 
    id: 901, 
    name: 'TotalEnergies', 
    email: 'hq@totalenergies.com',
    agentDedieId: 3,
    subClients: [
      { id: 3, name: 'Lucas Martin', email: 'l.martin@total.com' }, 
      { id: 4, name: 'Sophie Bernard', email: 's.bernard@total.com' }
    ] 
  }
];