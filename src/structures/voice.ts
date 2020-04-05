import {Snowflake} from "./generics.ts";
import {GuildMember} from "./guildMember.ts";


/** a voice region */
export interface Region {
	/** unique ID for the region */
	id: string;
	/** name of the region */
	name: string;
	/** true if this is a vip-only server */
	vip: boolean;
	/** true for a single server that is closest to the current user's client */
	optimal: boolean;
	/** whether this is a deprecated voice region (avoid switching to these) */
	deprecated: boolean;
	/** whether this is a custom voice region (used for events/etc) */
	custom: boolean;
}


/** a voice state. used to represent a user's voice connection status */
export interface State {
	/** the guild id this voice state is for */
	guild_id?: Snowflake;
	/** the channel id this user is connected to */
	channel_id: Snowflake | null;
	/** the user id this voice state is for */
	user_id: Snowflake;
	/** the guild member this voice state is for */
	member?: GuildMember;
	/** the session id for this voice state */
	session_id: string;
	/** whether this user is deafened by the server */
	deaf: boolean;
	/** whether this user is muted by the server */
	mute: boolean;
	/** whether this user is locally deafened */
	self_deaf: boolean;
	/** whether this user is locally muted */
	self_mute: boolean;
	/** whether this user is streaming using "Go Live" */
	self_stream?: boolean;
	/** whether this user is muted by the current user */
	suppress: boolean;
}
