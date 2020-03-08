import {Snowflake} from "../utils/mod.ts";

import User from "./User.ts";


export enum ExpireBehaviors {
	REMOVE_ROLE = 0,
	KICK = 1
}


export interface Account {
	id: string,
	name: string
}


export default class Integration {
	id: Snowflake;
	name: string;
	type: string;
	enabled: boolean;
	syncing: boolean;
	role_id: Snowflake;
	enable_emoticons?: boolean;
	expire_behavior: ExpireBehaviors;
	expire_grace_period: number;
	user: User;
	account: Account;
	synced_at: string;
}
