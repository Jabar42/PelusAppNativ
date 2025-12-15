export type UserRole = 'B2B' | 'B2C';

export interface User {
  id: string;
  email: string;
  role: UserRole;
}

