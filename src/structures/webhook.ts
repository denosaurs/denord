import {Snowflake} from "./generics.ts";
import {User} from "./user.ts";
import {Embed} from "./embed.ts";
import {AllowedMentions} from "./message.ts";


/** the types of webhooks */
export enum WebhookType {
	/** incoming webhooks can post messages to channels with a generated token */
	INCOMING = 1,
	/** channel follower webhooks are internal webhooks used with Channel Following to post new messages into channels */
	CHANNEL_FOLLOWER = 2
}


/** a webhook. webhooks are a low-effort way to post messages to channels in Discord. they do not require a bot user or authentication to use */
export interface Webhook {
	/** the id of the webhook */
	id: Snowflake;
	/** the type of the webhook */
	type: WebhookType;
	/** the guild id this webhook is for */
	guild_id?: Snowflake;
	/** the channel id this webhook is for */
	channel_id: Snowflake;
	/** the user this webhook was created by (not returned when getting a webhook with its token) */
	user?: User;
	/** the default name of the webhook */
	name?: string | null;
	/** the default avatar of the webhook */
	avatar?: string | null;
	/** the secure token of the webhook (returned for Incoming Webhooks) */
	token?: string;
}


export interface Create {
	name: string;
	avatar: string | null;
}

export interface Modify {
	name?: string;
	avatar?: string;
	channel_id?: Snowflake;
}

export interface ExecuteParams {
	wait?: boolean;
}

export interface ExecuteBody {
	content?: string;
	username?: string;
	avatar_url?: string;
	tts?: boolean;
	file?: File;
	embeds?: Embed[];
	payload_json?: string;
	allowed_mentions?: AllowedMentions;
}
