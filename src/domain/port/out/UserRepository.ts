import { User } from '../../user/User';

export interface CreateUserCommand {
  name: string;
  phoneNumber: string;
  gender: boolean;
}

export interface UserRepository {
  findById(userIdx: number): Promise<User | null>;
  save(command: CreateUserCommand): Promise<User>;
}
