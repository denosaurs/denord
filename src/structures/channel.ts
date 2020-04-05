import {ISO8601, Snowflake} from "./generics.ts";
import {User} from "./user.ts";


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


/** explicit permission overwrites for members and roles */
export interface Overwrite {
	/** role id or user id */
	id: Snowflake;
	/** what type of id you want to overwrite */
	type: "role" | "member";
	/** permission bit set */
	allow: number;
	/** permission bit set */
	deny: number;
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
export interface Channel {
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


export interface GetMessages {
	/** get messages around this message ID */
	around?: Snowflake;
	/** get messages before this message ID */
	before?: Snowflake;
	/** get messages after this message ID */
	after?: Snowflake;
	/** max number of messages to return (1-100) */
	limit?: number;
}

export interface GetReactions {
	/** get users before this user ID */
	before?: Snowflake;
	/** get users after this user ID */
	after?: Snowflake;
	/** max number of users to return (1-100) */
	limit?: number;
}

export interface BulkDelete {
	/** an array of message ids to delete (2-100) */
	messages: Snowflake[];
}

export interface GroupDMAddRecipient {
	/** access token of a user that has granted your app the `gdm.join` scope */
	access_token: string;
	/** nickname of the user being added */
	nick: string;
}

export interface CreateGuildChannel {
	/** channel name (2-100 characters) */
	name: string;
	/** the type of channel */
	type?: Type;
	/** channel topic (0-1024 characters) */
	topic?: string;
	/** the bitrate (in bits) of the voice channel (voice only) */
	bitrate?: number;
	/** the user limit of the voice channel (voice only) */
	user_limit?: number;
	/** amount of seconds a user has to wait before sending another message (0-21600); bots, as well as users with the permission `manage_messages` or `manage_channel`, are unaffected */
	rate_limit_per_user?: number;
	/** sorting position of the channel */
	position?: number;
	/** the channel's permission overwrites */
	permission_overwrites?: Overwrite[];
	/** id of the parent category for a channel */
	parent_id?: Snowflake;
	/** whether the channel is nsfw */
	nsfw?: boolean;
}

export type Modify = Partial<Omit<CreateGuildChannel, "type">>;

export interface GuildPosition {
	/** channel id */
	id: Snowflake;
	/** sorting position of the channel */
	position: number;
}

export interface CreateDM {
	/** the recipient to open a DM channel with */
	recipient_id: Snowflake;
}

export interface CreateGroupDM {
	/** access tokens of users that have granted your app the `gdm.join` scope */
	access_tokens: string[];
	/** a dictionary of user ids to their respective nicknames */
	nicks: { [key: string]: string }
}
