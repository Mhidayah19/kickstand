export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  createdAt: string;
  bikeCount: number;
}

export interface UpdateProfileInput {
  name?: string;
  avatarUrl?: string | null;
}
