import { Auth } from '../../auth/Auth';

export interface CreateAuthCommand {
  userIdx: number;
  provider: string;
  providerKey: string;
  accountName: string;
  passwordHash: string;
}

export interface AuthRepository {
  findByProviderKey(provider: string, providerKey: string): Promise<Auth | null>;
  save(command: CreateAuthCommand): Promise<Auth>;
}
