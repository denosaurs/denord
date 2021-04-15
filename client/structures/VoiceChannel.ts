import type { Client } from "../Client.ts";
import type { channel, Snowflake } from "../../discord_typings/mod.ts";
import { PermissionOverwrite } from "./GuildChannel.ts";
import { VoiceBasedChannel } from "./VoiceBasedChannel.ts";

export class VoiceChannel<T extends channel.VoiceChannel = channel.VoiceChannel>
  extends VoiceBasedChannel<T> {
  /** The type of this channel. */
  type = "voice" as const;

  constructor(client: Client, data: T) {
    super(client, data);
  }

  /** Edits this channel. Returns a new instance. */
  edit(options: {
    name?: string;
    position?: number | null;
    bitrate?: number | null;
    userLimit?: number | null;
    permissionOverwrites?: PermissionOverwrite[] | null;
    parentId?: Snowflake | null;
    voiceRegionId?: string | null;
    automaticVideoQuality?: boolean | null;
  }, reason?: string): Promise<VoiceChannel> {
    return super.edit(options, reason) as Promise<VoiceChannel>;
  }

  /** Deletes the channel. Returns a new instance. */
  delete(reason?: string): Promise<VoiceChannel> {
    return super.delete(reason) as Promise<VoiceChannel>;
  }
}
