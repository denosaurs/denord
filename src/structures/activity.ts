import {Snowflake} from "./generics.ts";
import {Emoji} from "./emoji.ts";


/** the type of the activity */
export enum Type {
	GAME = 0,
	STREAMING = 1,
	LISTENING = 2,
	CUSTOM = 4
}

/** flags for the activity */
export enum Flags {
	INSTANCE = 1 << 0,
	JOIN = 1 << 1,
	SPECTATE = 1 << 2,
	JOIN_REQUEST = 1 << 3,
	SYNC = 1 << 4,
	PLAY = 1 << 5
}

/** unix timestamps for start and/or end of the game */
export interface Timestamps {
	/** unix timestamp for start of the game */
	start?: number;
	/** unix timestamp for end of the game */
	end?: number;
}

/** information for an activity's party */
export interface Party {
	/** the id of the party */
	id?: string;
	/** two integers (current_size, max_size), used to show the party's current and maximum size */
	size?: [number, number];
}

/** assets an activity may have */
export interface Assets {
	/** the id for a large asset of the activity, usually a snowflake */
	large_image?: string;
	/** text displayed when hovering over the large image of the activity */
	large_text?: string;
	/** the id for a small asset of the activity, usually a snowflake */
	small_image?: string;
	/** text displayed when hovering over the small image of the activity */
	small_text?: string;
}

/** secrets for Rich Presence joining and spectating */
export interface Secrets {
	/** the secret for joining a party */
	join?: string;
	/** the secret for spectating a game */
	spectate?: string;
	/** the secret for a specific instanced match */
	match?: string;
}


/**
 * an activity
 * NOTE: bots are only able to send `name`, `type`, and optionally `url`.
 */
export interface Activity {
	/** the activity's name */
	name: string;
	/** the type of the activity */
	type: Type;
	/** stream url, is validated when type is 1 */
	url?: string | null;
	/** unix timestamp of when the activity was added to the user's session */
	created_at: number;
	/** unix timestamps for start and/or end of the game */
	timestamps?: Timestamps;
	/** application id for the game */
	application_id?: Snowflake;
	/** what the player is currently doing */
	details?: string | null;
	/** the user's current party status */
	state?: string | null;
	/** the emoji used for a custom status */
	emoji?: Emoji | null;
	/** information for the current party of the player */
	party?: Party;
	/** images for the presence and their hover texts */
	assets?: Assets;
	/** secrets for Rich Presence joining and spectating */
	secrets?: Secrets;
	/** whether or not the activity is an instanced game session */
	instance?: boolean;
	/** activity flags `OR`d together, describes what the payload includes */
	flags?: number;
}
