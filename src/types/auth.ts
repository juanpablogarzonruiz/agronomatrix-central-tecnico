export type EcosystemAppId = 'admin' | 'campo' | 'central';

export interface EcosystemUserAccount {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  isPrimary?: boolean;
  assignedApps?: EcosystemAppId[];
  password?: string;
  totpSecret?: string;
  status: 'active' | 'suspended';
  avatarUrl?: string;
  createdAt?: string;
  authProvider?: string;
}

export type AuthUser = EcosystemUserAccount;

export interface AuthSession {
  user: EcosystemUserAccount;
  token: string;
  authenticatedAt: string;
  expiresAt: string;
  firebaseUid?: string;
}
