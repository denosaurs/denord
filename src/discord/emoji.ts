import type { Snowflake } from "./common.ts";
import type { PublicUser } from "./user.ts";

export interface BaseEmoji {
  id: Snowflake | null;
  name: string | null;
  roles?: Snowflake[];
  user?: PublicUser;
  require_colons?: boolean;
  managed?: boolean;
  animated?: boolean;
  available?: boolean;
}

interface idEmoji extends BaseEmoji {
  id: Snowflake;
}

interface nameEmoji extends BaseEmoji {
  name: string;
}

export type Emoji = idEmoji | nameEmoji;

export type GuildEmoji = idEmoji & nameEmoji;

export interface Create {
  name: string;
  image: string;
  roles: Snowflake[];
}

export interface Modify {
  name?: string;
  roles?: Snowflake[] | null;
}
