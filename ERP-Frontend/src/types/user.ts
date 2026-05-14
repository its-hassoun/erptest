export type UserRole = 'Admin' | 'agent' | 'client' | 'subclient';

export interface User {
  id: number; 
  name: string;
  email: string;
  team: string;
  role: UserRole;
  avatarInitials: string;
  avatarColor: string;
  clientCompanyId?: number;
}