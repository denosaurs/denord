import {ISO8601, Snowflake} from "../utils/mod.ts";

import User from "./User.ts";


/** the integration expire behaviors */
export enum ExpireBehaviors {
	REMOVE_ROLE = 0,
	KICK = 1
}

/** an integration account */
export interface Account {
	/** id of the account */
	id: string,
	/** name of the account */
	name: string
}


/** an integration */
export default class Integration {
	/** integration id */
	id: Snowflake;
	/** integration name */
	name: string;
	/** integration type (twitch, youtube, etc) */
	type: string;
	/** is this integration enabled */
	enabled: boolean;
	/** is this integration syncing */
	syncing: boolean;
	/** id that this integration uses for "subscribers" */
	role_id: Snowflake;
	/** whether emoticons should be synced for this integration (twitch only currently) */
	enable_emoticons?: boolean;
	/** the behavior of expiring subscribers */
	expire_behavior: ExpireBehaviors;
	/** the grace period (in days) before expiring subscribers */
	expire_grace_period: number;
	/** user for this integration */
	user: User;
	/** integration account information */
	account: Account;
	/** when this integration was last synced */
	synced_at: ISO8601;
}
