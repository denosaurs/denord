import {Snowflake} from "../utils/mod.ts";

import Emoji from "./Emoji.ts";


export enum Type {
	GAME = 0,
	STREAMING = 1,
	LISTENING = 2,
	CUSTOM = 4
}

export enum Flags {
	INSTANCE = 1 << 0,
	JOIN = 1 << 1,
	SPECTATE = 1 << 2,
	JOIN_REQUEST = 1 << 3,
	SYNC = 1 << 4,
	PLAY = 1 << 5
}


export interface Timestamps {
	start?: number,
	end?: number
}

export interface Party {
	id?: string,
	size?: [number, number]
}

export interface Assets {
	large_image?: string,
	large_text?: string,
	small_image?: string,
	small_text?: string
}

export interface Secrets {
	join?: string,
	spectate?: string,
	match?: string
}


export default class Activity {
	name: string;
	type: Type;
	url?: string | null;
	created_at: number;
	timestamps?: Timestamps;
	application_id?: Snowflake;
	details?: string | null;
	state?: string | null;
	emoji?: Emoji | null;
	party?: Party;
	assets?: Assets;
	secrets?: Secrets;
	instance?: boolean;
	flags?: Flags;
}
