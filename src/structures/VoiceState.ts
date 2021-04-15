import type { Snowflake, voice } from "../discord/mod.ts";
import { GuildMember } from "./GuildMember.ts";
import type { Client } from "../Client.ts";

export interface State {
  guildId?: Snowflake;
  channelId: Snowflake | null;
  userId: Snowflake;
  member?: GuildMember;
  sessionId: string;
  deaf: boolean;
  mute: boolean;
  selfDeaf: boolean;
  selfMute: boolean;
  selfStream?: boolean;
  selfVideo: boolean;
  suppress: boolean;
  requestToSpeakTimestamp: number | null;
}

export function parseState(state: voice.State, client?: Client): State {
  return {
    guildId: state.guild_id,
    channelId: state.channel_id,
    userId: state.user_id,
    member: state.member &&
      new GuildMember(client!, state.member, state.guild_id!),
    sessionId: state.session_id,
    deaf: state.deaf,
    mute: state.mute,
    selfDeaf: state.self_deaf,
    selfMute: state.self_mute,
    selfStream: state.self_stream,
    selfVideo: state.self_video,
    suppress: state.suppress,
    requestToSpeakTimestamp: state.request_to_speak_timestamp
      ? Date.parse(state.request_to_speak_timestamp)
      : null,
  };
}
