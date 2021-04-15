import type { Snowflake } from "./common.ts";
import type { PublicUser } from "./user.ts";

export interface Team {
  icon: string | null;
  id: Snowflake;
  members: Member[];
  owner_user_id: Snowflake;
}

export interface Member {
  membership_state: MembershipState;
  permissions: ["*"];
  team_id: Snowflake;
  user: Pick<PublicUser, "avatar" | "discriminator" | "id" | "username">;
}

export type MembershipState = 1 | 2;
