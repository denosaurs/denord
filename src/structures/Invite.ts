import Channel from "./Channel.ts";
import Guild from "./Guild.ts";
import User from "./User.ts";


export enum TargetUserType {
	STREAM = 1
}


export interface Metadata extends Invite {
	uses: number,
	max_uses: number,
	max_age: number,
	temporary: boolean,
	created_at: string
}


export default class Invite {
	code: string;
	guild?: Partial<Guild>;
	channel: Partial<Channel>;
	inviter?: User;
	target_user?: Partial<User>;
	target_user_type?: TargetUserType;
	approximate_presence_count?: number;
	approximate_member_count?: number;
}
