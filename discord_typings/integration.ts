import type { ISO8601, Snowflake } from "./common.ts";
import type { PublicUser } from "./user.ts";

export interface Integration {
  id: Snowflake;
  name: string;
  type: string;
  enabled: boolean;
  syncing?: boolean;
  role_id?: Snowflake;
  enable_emoticons?: boolean;
  expire_behavior?: 0 | 1;
  expire_grace_period?: number;
  user?: PublicUser;
  account: Account;
  synced_at?: ISO8601;
  subscriber_count?: number;
  revoked?: boolean;
  application?: Application;
}

export interface Account {
  id: string;
  name: string;
}

export interface Application {
  id: Snowflake;
  name: string;
  icon: string | null;
  description: string;
  summary: string;
  bot?: PublicUser;
}

export interface DeleteEvent {
  id: Snowflake;
  guild_id: Snowflake;
  application_id?: Snowflake;
}
