import {Snowflake} from "../utils/mod.ts";

import User from "./User.ts";


export enum Type {
	GUILD_TEXT = 0,
	DM = 1,
	GUILD_VOICE = 2,
	GROUP_DM = 3,
	GUILD_CATEGORY = 4,
	GUILD_NEWS = 5,
	GUILD_STORE = 6
}

export enum AllowedMentionTypes {
	ROLE_MENTIONS = "roles",
	USER_MENTIONS = "users",
	EVERYONE_MENTIONS = "everyone"
}


export interface Overwrite {
	id: Snowflake,
	type: "role" | "member",
	allow: number,
	deny: number
}

export interface AllowedMentions {
	parse: AllowedMentionTypes[],
	roles: Snowflake[],
	users: Snowflake[]
}

export interface Mention {
	id: Snowflake;
	guild_id: Snowflake;
	type: Type;
	name: string;
}


export default class Channel {
	id: Snowflake;
	type: Type;
	guild_id?: Snowflake;
	position?: number;
	permission_overwrites?: Overwrite[];
	name?: string;
	topic?: string | null;
	nsfw?: boolean;
	last_message_id?: Snowflake | null;
	bitrate?: number;
	user_limit?: number;
	rate_limit_per_user?: number;
	recipients?: User[];
	icon?: string | null;
	owner_id?: Snowflake;
	application_id?: Snowflake;
	parent_id?: Snowflake | null;
	last_pin_timestamp?: string;
}
