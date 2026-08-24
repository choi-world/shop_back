import { AuthUseCase, SignupRequest, LoginRequest, LoginResult } from '../port/in/AuthUseCase';
import { AuthRepository } from '../port/out/AuthRepository';
import { UserRepository } from '../port/out/UserRepository';
import { PasswordHasher } from '../port/out/PasswordHasher';
import { TokenIssuer } from '../port/out/TokenIssuer';
import { ValidationError } from '../error/ValidationError';
import { ConflictError } from '../error/ConflictError';
import { UnauthorizedError } from '../error/UnauthorizedError';

const LOCAL_PROVIDER = 'LOCAL';

export class AuthService implements AuthUseCase {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenIssuer: TokenIssuer,
  ) {}

  async signup(req: SignupRequest): Promise<{ userIdx: number }> {
    if (!req.phone_number || !req.password || !req.name) {
      throw new ValidationError('필수 정보가 누락되었습니다.');
    }

    const existing = await this.authRepository.findByProviderKey(LOCAL_PROVIDER, req.phone_number);
    if (existing) throw new ConflictError('이미 가입된 전화번호입니다.');

    const user = await this.userRepository.save({
      name: req.name,
      phoneNumber: req.phone_number,
      gender: req.gender,
    });

    const passwordHash = await this.passwordHasher.hash(req.password);

    await this.authRepository.save({
      userIdx: user.userIdx,
      provider: LOCAL_PROVIDER,
      providerKey: req.phone_number,
      accountName: req.phone_number,
      passwordHash,
    });

    return { userIdx: user.userIdx };
  }

  async login(req: LoginRequest): Promise<LoginResult> {
    // 전화번호가 없는 건지 비밀번호가 틀린 건지 구분해서 알려주지 않는다 —
    // 둘 다 같은 메시지로 응답해서 가입 여부 자체가 노출되지 않게 한다.
    const invalid = () => new UnauthorizedError('전화번호 또는 비밀번호가 일치하지 않습니다.');

    const auth = await this.authRepository.findByProviderKey(LOCAL_PROVIDER, req.phone_number);
    if (!auth || !auth.passwordHash) throw invalid();

    const matches = await this.passwordHasher.compare(req.password, auth.passwordHash);
    if (!matches) throw invalid();

    const accessToken = this.tokenIssuer.issue({ userIdx: auth.userIdx });
    return { accessToken };
  }
}
