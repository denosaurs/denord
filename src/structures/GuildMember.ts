import {ISO8601, Snowflake} from "../utils/mod.ts";

import User from "./User.ts";
import Guild from "./Guild.ts";


/** a member of a guild */
export default class GuildMember {
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
	
	/** the guild the member is part of */
	guild: Guild;
}
