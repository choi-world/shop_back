import { User } from '../../user/User';

export interface UserRepository {
  findById(userIdx: number): Promise<User | null>;
}
