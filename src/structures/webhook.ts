import {Snowflake} from "./generics.ts";
import {User} from "./user.ts";
import {Embed} from "./embed.ts";
import {Create as MessageCreate} from "./message.ts";


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


export type Create =
	NonNullable<Pick<Webhook, "name">>
	& Required<Pick<Webhook, "name">>;

export type Modify = Partial<NonNullable<Pick<Webhook, "name" | "avatar" | "channel_id">>>;

export interface ExecuteParams {
	/** waits for server confirmation of message send before response, and returns the created message body (defaults to `false`; when `false` a message that is not saved does not return an error) */
	wait?: boolean;
}

export interface ExecuteBody extends Omit<MessageCreate, "embed" | "nonce"> {
	/** override the default username of the webhook */
	username?: string;
	/** override the default avatar of the webhook */
	avatar_url?: string;
	/** embedded `rich` content */
	embeds?: Embed[];
}


export type UpdateEvent = NonNullable<Pick<Webhook, "guild_id" | "channel_id">>
