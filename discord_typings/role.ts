import type { Snowflake } from "./common.ts";

export interface Role {
  id: Snowflake;
  name: string;
  color: number;
  hoist: boolean;
  position: number;
  permissions: string;
  managed: boolean;
  mentionable: boolean;
  tags?: Tags;
}

export interface Tags {
  bot_id?: Snowflake;
  integration_id?: Snowflake;
  premium_subscriber?: null;
}

export interface Create
  extends Partial<Pick<Role, "name" | "color" | "hoist" | "mentionable">> {
  permissions?: string;
}

export type ModifyPosition = Pick<Role, "id" | "position">;

export type Modify = Create;

export interface UpdateEvent {
  guild_id: Snowflake;
  role: Role;
}

export interface DeleteEvent {
  guild_id: Snowflake;
  role_id: Snowflake;
}
