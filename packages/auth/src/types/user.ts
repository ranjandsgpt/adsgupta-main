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

/** Host / brand surface id (not a central product tool slug). Pousali is a brand host for marketplace audit. */
export type AuthAppId =
  | 'marketplace'
  | 'exchange'
  | 'blog'
  | 'talentos'
  | 'platform'
  | 'pousali'
  | 'adsgupta'
  | 'amazon-audit';
