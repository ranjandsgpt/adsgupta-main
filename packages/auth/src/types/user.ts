export interface CentralUser {
  id: string;
  email: string;
  name: string | null;
  passwordHash: string | null;
  image: string | null;
  emailVerified: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export type AuthAppId = 'amazon-audit' | 'marketplace' | 'exchange' | 'pousali' | 'adsgupta';
