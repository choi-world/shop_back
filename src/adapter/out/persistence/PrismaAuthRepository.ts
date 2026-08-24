import { PrismaClient } from '../../../generated/prisma/client';
import { AuthRepository, CreateAuthCommand } from '../../../domain/port/out/AuthRepository';
import { Auth } from '../../../domain/auth/Auth';

export class PrismaAuthRepository implements AuthRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByProviderKey(provider: string, providerKey: string): Promise<Auth | null> {
    const row = await this.prisma.auth.findUnique({
      where: { provider_provider_key: { provider, provider_key: providerKey } },
    });

    if (!row || row.is_deleted) return null;

    return toDomain(row);
  }

  async save(command: CreateAuthCommand): Promise<Auth> {
    const row = await this.prisma.auth.create({
      data: {
        user_idx: command.userIdx,
        provider: command.provider,
        provider_key: command.providerKey,
        account_name: command.accountName,
        password_hash: command.passwordHash,
      },
    });

    return toDomain(row);
  }
}

function toDomain(row: {
  auth_idx: bigint;
  user_idx: bigint;
  provider: string;
  provider_key: string;
  account_name: string | null;
  password_hash: string | null;
}): Auth {
  return new Auth(
    Number(row.auth_idx),
    Number(row.user_idx),
    row.provider,
    row.provider_key,
    row.account_name,
    row.password_hash,
  );
}
