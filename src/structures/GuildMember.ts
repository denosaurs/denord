import {Snowflake} from "../utils/mod.ts";

import User from "./User.ts";


export default class GuildMember {
	user: User;
	nick?: string;
	roles: Snowflake[];
	joined_at: string;
	premium_since?: string | null;
	deaf: boolean;
	mute: boolean;
}
