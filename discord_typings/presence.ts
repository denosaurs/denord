import type { Snowflake } from "./common.ts";
import type { PublicUser } from "./user.ts";
import type { Emoji } from "./emoji.ts";

export interface Presence {
  user: Pick<PublicUser, "id"> & Partial<PublicUser>;
  guild_id?: Snowflake;
  status?: Exclude<ActiveStatus, "invisible">;
  activities?: Activity[];
  client_status?: ClientStatus;
}

export interface Activity {
  name: string;
  type: Type;
  url?: string | null;
  created_at: number;
  timestamps?: Timestamps;
  application_id?: Snowflake;
  details?: string | null;
  state?: string | null;
  emoji?: Emoji | null;
  party?: Party;
  assets?: Assets;
  secrets?: Secrets;
  instance?: boolean;
  flags?: number;
  buttons?: Button[];
}

export type Type = 0 | 1 | 2 | 3 | 4 | 5;

export interface Button {
  label: string;
  url: string;
}

export interface Timestamps {
  start?: number;
  end?: number;
}

export interface Party {
  id?: string;
  size?: [number, number];
}

export interface Assets {
  large_image?: string;
  large_text?: string;
  small_image?: string;
  small_text?: string;
}

export interface Secrets {
  join?: string;
  spectate?: string;
  match?: string;
}

export interface ClientStatus {
  desktop?: Exclude<ActiveStatus, "invisible" | "offline">;
  mobile?: Exclude<ActiveStatus, "invisible" | "offline">;
  web?: Exclude<ActiveStatus, "invisible" | "offline">;
}

export type ActiveStatus =
  | "idle"
  | "dnd"
  | "online"
  | "invisible"
  | "offline";
