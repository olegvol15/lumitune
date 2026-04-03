export type OAuthProvider = 'google' | 'apple' | 'facebook';

export interface OAuthProfile {
  provider: OAuthProvider;
  oauthId: string;
  email: string;
  displayName: string;
  profilePicture?: string;
}