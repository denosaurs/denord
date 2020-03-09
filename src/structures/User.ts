import {Snowflake} from "../utils/mod.ts";

import Integration from "./Integration.ts";


/** possible user flags */
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

/** connection visibility */
export enum PremiumType {
	NITRO_CLASSIC = 1,
	NITRO = 2
}

/** connection visibility */
export enum ConnectionVisibilityType {
	/** invisible to everyone except the user themselves */
	NONE = 0,
	/** visible to everyone */
	EVERYONE = 1
}


/** the connection object that the user has attached */
export interface Connection {
	/** id of the connection account */
	id: string,
	/** the username of the connection account */
	name: string,
	/** the service of the connection (twitch, youtube) */
	type: string,
	/** whether the connection is revoked */
	revoked: boolean,
	/** an array of partial server integrations */
	integrations: Partial<Integration>[],
	/** whether the connection is verified */
	verified: boolean,
	/** whether friend sync is enabled for this connection */
	friend_sync: boolean,
	/** whether activities related to this connection will be shown in presence updates */
	show_activity: boolean,
	/** visibility of this connection */
	visibility: ConnectionVisibilityType
}


/** a user */
export default class User {
	/** the user's id */
	id: Snowflake;
	/** the user's username, not unique across the platform */
	username: string;
	/** the user's 4-digit discord-tag */
	discriminator: string;
	/** the user's avatar hash */
	avatar: string | null;
	/** whether the user belongs to an OAuth2 application */
	bot?: boolean;
	/** whether the user is an Official Discord System user (part of the urgent message system) */
	system?: boolean;
	/** whether the user has two factor enabled on their account */
	mfa_enabled?: boolean;
	/** the user's chosen language option */
	locale?: string;
	/** whether the email on this account has been verified */
	verified?: boolean;
	/** the user's email */
	email?: string;
	/** user flags `OR`d together, describes extra characteristics of a user */
	flags?: UserFlags;
	/** the type of Nitro subscription on a user's account */
	premium_type?: PremiumType;
}
