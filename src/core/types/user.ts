export type UserRole = 'B2B' | 'B2C';
export type UserType = 'pet_owner' | 'professional';

export interface User {
  id: string;
  email: string;
}
