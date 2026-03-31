export interface UserProfile {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  bikeCount: number;
}

export interface UpdateProfileInput {
  name?: string;
}
