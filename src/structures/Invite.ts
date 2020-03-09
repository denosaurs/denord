import {ISO8601} from "../utils/mod.ts";

import Channel from "./Channel.ts";
import Guild from "./Guild.ts";
import User from "./User.ts";


/** type of target user for an invite */
export enum TargetUserType {
	STREAM = 1
}


/** extra information about an invite */
export interface Metadata extends Invite {
	/** number of times this invite has been used */
	uses: number,
	/** max number of times this invite can be used */
	max_uses: number,
	/** duration (in seconds) after which the invite expires */
	max_age: number,
	/** whether this invite only grants temporary membership */
	temporary: boolean,
	/** when this invite was created */
	created_at: ISO8601
}


export default class Invite {
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
