import {Snowflake} from "../utils/mod.ts";

import Integration from "./Integration.ts";


export enum UserFlags {
	NONE = 0,
	DISCORD_EMPLOYEE = 1 << 0,
	DISCORD_PARTNER = 1 << 1,
	HYPESQUAD_EVENTS = 1 << 2,
	BUG_HUNTER_LEVEL_1 = 1 << 3,
	HOUSE_BRAVERY = 1 << 6,
	HOUSE_BRILLIANCE = 1 << 7,
	HOUSE_BALANCE = 1 << 8,
	EARLY_SUPPORTER = 1 << 9,
	TEAM_USER = 1 << 10,
	SYSTEM = 1 << 12,
	BUG_HUNTER_LEVEL_2 = 1 << 14
}

export enum ConnectionVisibilityType {
	NONE = 0,
	EVERYONE = 1
}


export interface Connection {
	id: string,
	name: string,
	type: string,
	revoked: boolean,
	integrations: Partial<Integration>[],
	verified: string,
	friend_sync: boolean,
	show_activity: boolean,
	visibility: ConnectionVisibilityType
}


export default class User {
	id: Snowflake;
	username: string;
	discriminator: string;
	avatar: string | null;
	bot?: boolean;
	system?: boolean;
	mfa_enabled?: boolean;
	locale?: string;
	verified?: boolean;
	flags?: UserFlags;
	premium_type?: 1 | 2;
}
