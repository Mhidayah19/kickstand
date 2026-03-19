export interface User {
  id: string;
  email: string;
  name: string;
  activeBikeId: string | null;
  expoToken: string | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}
