import {Snowflake} from "../utils/mod.ts";

import GuildMember from "./GuildMember.ts";


export interface VoiceRegion {
	id: string,
	name: string,
	vip: boolean,
	optimal: boolean,
	deprecated: boolean,
	custom: boolean
}

export default class VoiceState {
	guild_id?: Snowflake;
	channel_id: Snowflake | null;
	user_id: Snowflake;
	member?: GuildMember;
	session_id: string;
	deaf: boolean;
	mute: boolean;
	self_deaf: boolean;
	self_mute: boolean;
	self_stream?: boolean;
	suppress: boolean;
}
