import {ISO8601, Snowflake} from "./generics.ts";
import {Guild} from "./guild.ts";
import {User} from "./user.ts";
import {Channel} from "./channel.ts";


/** type of target user for an invite */
export enum TargetUserType {
	STREAM = 1
}


/** extra information about an invite */
export interface MetadataInvite extends Invite {
	/** number of times this invite has been used */
	uses: number;
	/** max number of times this invite can be used */
	max_uses: number;
	/** duration (in seconds) after which the invite expires */
	max_age: number;
	/** whether this invite only grants temporary membership */
	temporary: boolean;
	/** when this invite was created */
	created_at: ISO8601;
}

/** a guild channel invite */
export interface Invite {
	/** the invite code (unique ID) */
	code: string;
	/** the guild this invite is for */
	guild?: Partial<Guild>;
	/** the channel this invite is for */
	channel: Partial<Channel>;
	/** the user who created the invite */
	inviter?: User;
	/** the target user for this invite */
	target_user?: Partial<User>;
	/** the type of target user for this invite */
	target_user_type?: TargetUserType;
	/** approximate count of online members (only present when target_user is set) */
	approximate_presence_count?: number;
	/** approximate count of total members */
	approximate_member_count?: number;
}


export interface Create extends Partial<Pick<MetadataInvite, "max_age" | "max_uses" | "temporary" | "target_user_type">> {
	/** if true, don't try to reuse a similar invite (useful for creating many unique one time use invites) (default: false) */
	unique?: boolean;
	/** the target user id for this invite */
	target_user?: Snowflake;
}

export type VanityURL = Pick<MetadataInvite, "code" | "uses">;

export interface CreateEvent extends Pick<MetadataInvite, "code" | "created_at" | "inviter" | "max_age" | "max_uses" | "target_user" | "target_user_type" | "temporary" | "uses"> {
	channel_id: Snowflake;
	guild_id: Snowflake;
}

export type DeleteEvent =
	Pick<CreateEvent, "channel_id" | "code">
	& Partial<Pick<CreateEvent, "guild_id">>
