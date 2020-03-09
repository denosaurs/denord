import {ISO8601, Snowflake} from "../utils/mod.ts";

import User from "./User.ts";


/** types of channels */
export enum Type {
	/** a text channel within a server */
	GUILD_TEXT = 0,
	/** a direct message between users */
	DM = 1,
	/** a voice channel within a server */
	GUILD_VOICE = 2,
	/** a direct message between multiple users */
	GROUP_DM = 3,
	/** an organizational category that contains up to 50 channels */
	GUILD_CATEGORY = 4,
	/** a channel that users can follow and crosspost into their own server */
	GUILD_NEWS = 5,
	/** a channel in which game developers can sell their game on Discord */
	GUILD_STORE = 6
}

/** allowed mentions */
export enum AllowedMentionTypes {
	/** Controls role mentions */
	ROLE_MENTIONS = "roles",
	/** Controls user mentions */
	USER_MENTIONS = "users",
	/** Controls @everyone and @here mentions */
	EVERYONE_MENTIONS = "everyone"
}


/** explicit permission overwrites for members and roles */


export interface Overwrite {
	/** role id or user id */
	id: Snowflake,
	/** what type of id you want to overwrite */
	type: "role" | "member",
	/** permission bit set */
	allow: number,
	/** permission bit set */
	deny: number
}

/** allowed mentions allows for more granular control over mentions without various hacks to the message content. this will always validate against message content to avoid phantom pings (e.g. to ping everyone, you must still have `@everyone` in the message content), and check against user/bot permissions */
export interface AllowedMentions {
	/** An array of allowed mention types to parse from the content. */
	parse: AllowedMentionTypes[],
	/** Array of role_ids to mention (Max size of 100) */
	roles: Snowflake[],
	/** Array of user_ids to mention (Max size of 100) */
	users: Snowflake[]
}

/** a channel mention */
export interface Mention {
	/** id of the channel */
	id: Snowflake;
	/** id of the guild containing the channel */
	guild_id: Snowflake;
	/** the type of channel */
	type: Type;
	/** the name of the channel */
	name: string;
}


/** a channel */
export default class Channel {
	/** the id of this channel */
	id: Snowflake;
	/** the type of channel */
	type: Type;
	/** the id of the guild */
	guild_id?: Snowflake;
	/** sorting position of the channel */
	position?: number;
	/** explicit permission overwrites for members and roles */
	permission_overwrites?: Overwrite[];
	/** the name of the channel (2-100 characters) */
	name?: string;
	/** the channel topic (0-1024 characters) */
	topic?: string | null;
	/** whether the channel is nsfw */
	nsfw?: boolean;
	/** the id of the last message sent in this channel (may not point to an existing or valid message) */
	last_message_id?: Snowflake | null;
	/** the bitrate (in bits) of the voice channel */
	bitrate?: number;
	/** the user limit of the voice channel */
	user_limit?: number;
	/** amount of seconds a user has to wait before sending another message (0-21600); bots, as well as users with the permission `manage_messages` or `manage_channel`, are unaffected */
	rate_limit_per_user?: number;
	/** the recipients of the DM */
	recipients?: User[];
	/** icon hash */
	icon?: string | null;
	/** id of the DM creator */
	owner_id?: Snowflake;
	/** application id of the group DM creator if it is bot-created */
	application_id?: Snowflake;
	/** id of the parent category for a channel (each parent category can contain up to 50 channels) */
	parent_id?: Snowflake | null;
	/** when the last pinned message was pinned */
	last_pin_timestamp?: ISO8601;
}
