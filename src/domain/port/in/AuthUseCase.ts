export interface SignupRequest {
  phone_number: string;
  password: string;
  name: string;
  gender: boolean;
}

export interface LoginRequest {
  phone_number: string;
  password: string;
}

export interface LoginResult {
  accessToken: string;
}

export interface AuthUseCase {
  signup(req: SignupRequest): Promise<{ userIdx: number }>;
  login(req: LoginRequest): Promise<LoginResult>;
}
