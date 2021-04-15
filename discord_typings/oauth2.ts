import type { ISO8601, Snowflake } from "./common.ts";
import type { PublicUser } from "./user.ts";
import type { Team } from "./teams.ts";

export type Scopes =
  | "bot"
  | "connections"
  | "email"
  | "identify"
  | "guilds"
  | "guilds.join"
  | "gdm.join"
  | "messages.read"
  | "rpc"
  | "rpc.api"
  | "rpc.notifications.read"
  | "webhook.incoming"
  | "applications.builds.upload"
  | "applications.builds.read"
  | "applications.store.update"
  | "applications.entitlements"
  | "relationships.read"
  | "activities.read"
  | "activities.write"
  | "applications.commands"
  | "applications.commands.update";

export interface AccessTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}

export type ClientCredentialsAccessTokenResponse = Omit<
  AccessTokenResponse,
  "refresh_token"
>;

export interface BotAuthParameters {
  client_id: Snowflake;
  scope: string;
  permissions: number;
  guild_id: Snowflake;
  disable_guild_select: boolean;
}

// TODO: https://discord.com/developers/docs/topics/oauth2#advanced-bot-authorization

// TODO: https://discord.com/developers/docs/topics/oauth2#webhooks

export interface Application {
  id: Snowflake;
  name: string;
  icon: string | null;
  description: string;
  rpc_origins?: string[];
  bot_public: boolean;
  bot_require_code_grant: boolean;
  owner: Partial<PublicUser>;
  summary: string;
  verify_key: string;
  team: Team | null;
  guild_id?: Snowflake;
  primary_sku_id?: Snowflake;
  slug?: string;
  cover_image?: string;
  flags: number;
}

export type CurrentApplicationInformation = Omit<Application, "flags">;

export interface GetCurrentAuthorizationInformation {
  application: Partial<Application>;
  scopes: string[];
  expires: ISO8601;
  user?: PublicUser;
}
