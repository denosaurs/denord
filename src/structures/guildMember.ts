import {ISO8601, Snowflake} from "./generics.ts";
import {User} from "./user.ts";


/** a member of a guild */
export interface GuildMember {
	/** the user this guild member represents */
	user: User;
	/** this user's guild nickname (if one is set) */
	nick?: string;
	/** array of role object ids the user has */
	roles: Snowflake[];
	/** when the user joined the guild */
	joined_at: ISO8601;
	/** when the user started boosting the guild */
	premium_since?: ISO8601 | null;
	/** whether the user is deafened in voice channels */
	deaf: boolean;
	/** whether the user is muted in voice channels */
	mute: boolean;
}


export interface List {
	/** max number of members to return (1-1000) */
	limit?: number;
	/** the highest user id in the previous page */
	after?: Snowflake;
}

type MinimalGuildMember = Partial<Pick<GuildMember, "nick" | "roles" | "mute" | "deaf">>;

export interface Add extends MinimalGuildMember {
	/** an oauth2 access token granted with the `guilds.join` to the bot's application for the user you want to add to the guild */
	access_token: string;
}

export interface Modify extends MinimalGuildMember {
	/** id of channel to move user to (if they are connected to voice) */
	channel_id?: Snowflake | null;
}

export interface ModifyCurrentNick {
	/** value to set users nickname to */
	nick: string;
}
