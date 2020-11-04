import type { integration, Snowflake } from "../discord.ts";
import { User } from "./User.ts";
import type { Client } from "../Client.ts";

export interface Integration {
  id: Snowflake;
  name: string;
  type: string;
  enabled: boolean;
  syncing?: boolean;
  roleId?: Snowflake;
  enableEmoticons?: boolean;
  expireBehavior?: 0 | 1;
  expireGracePeriod?: number;
  user?: User;
  account: Account;
  syncedAt?: number;
  subscriberCount?: number;
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
  bot?: User;
}

export function parseIntegration(
  client: Client,
  integration: integration.Integration,
): Integration {
  return {
    id: integration.id,
    name: integration.name,
    type: integration.type,
    enabled: integration.enabled,
    syncing: integration.syncing,
    roleId: integration.role_id,
    enableEmoticons: integration.enable_emoticons,
    expireBehavior: integration.expire_behavior,
    expireGracePeriod: integration.expire_grace_period,
    user: integration.user && new User(client, integration.user),
    account: integration.account,
    syncedAt: integration.synced_at
      ? Date.parse(integration.synced_at)
      : undefined,
    subscriberCount: integration.subscriber_count,
    revoked: integration.revoked,
    application: integration.application && {
      id: integration.application.id,
      name: integration.application.name,
      icon: integration.application.icon,
      description: integration.application.description,
      summary: integration.application.summary,
      bot: integration.application.bot &&
        new User(client, integration.application.bot),
    },
  };
}
