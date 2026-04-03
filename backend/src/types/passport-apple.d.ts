declare module 'passport-apple' {
  import { Strategy } from 'passport';

  interface AppleStrategyOptions {
    clientID: string;
    teamID: string;
    keyID: string;
    privateKeyLocation?: string;
    privateKeyString?: string;
    callbackURL: string;
    passReqToCallback?: boolean;
    scope?: string[];
  }

  interface AppleProfile {
    id: string;
    email?: string;
    displayName?: string;
  }

  type VerifyCallback = (
    accessToken: string,
    refreshToken: string,
    idToken: string,
    profile: AppleProfile,
    done: (err: Error | null, user?: any) => void
  ) => void;

  class AppleStrategy extends Strategy {
    constructor(options: AppleStrategyOptions, verify: VerifyCallback);
  }

  export default AppleStrategy;
}