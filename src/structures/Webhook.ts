import {Snowflake} from "../utils/mod.ts";

import User from "./User.ts";


enum WebhookType {
	INCOMING = 1,
	CHANNEL_FOLLOWER = 2
}


export default class Webhook {
	id: Snowflake;
	type: WebhookType;
	guild_id?: Snowflake;
	channel_id: Snowflake;
	user?: User;
	name?: string | null;
	avatar?: string | null;
	token?: string;
}
