import type { Snowflake } from "./common.ts";
import type { Integration } from "./integration.ts";

export interface PublicUser {
  id: Snowflake;
  username: string;
  discriminator: string;
  avatar: string | null;
  bot?: boolean;
  system?: boolean;
  public_flags?: number;
}

export interface PrivateUser extends PublicUser {
  mfa_enabled: boolean;
  locale: string;
  verified: boolean;
  email: string | null;
  flags?: number;
  premium_type?: 0 | 1 | 2;
}

export interface Connection {
  id: string;
  name: string;
  type: string;
  revoked: boolean;
  integrations: Partial<Integration>[];
  verified: boolean;
  friend_sync: boolean;
  show_activity: boolean;
  visibility: 0 | 1;
}

export type Modify = Partial<Pick<PrivateUser, "username" | "avatar">>;

export interface GetGuilds {
  before?: Snowflake;
  after?: Snowflake;
  limit?: number;
}
