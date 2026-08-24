import { PrismaClient } from '../../../generated/prisma/client';
import { UserRepository, CreateUserCommand } from '../../../domain/port/out/UserRepository';
import { User } from '../../../domain/user/User';

export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(userIdx: number): Promise<User | null> {
    const row = await this.prisma.users.findUnique({
      where: { user_idx: userIdx },
    });

    if (!row || row.is_deleted) return null;

    return new User(Number(row.user_idx), row.name, row.phone_number, row.gender);
  }

  async save(command: CreateUserCommand): Promise<User> {
    const row = await this.prisma.users.create({
      data: {
        name: command.name,
        phone_number: command.phoneNumber,
        gender: command.gender,
      },
    });

    return new User(Number(row.user_idx), row.name, row.phone_number, row.gender);
  }
}
