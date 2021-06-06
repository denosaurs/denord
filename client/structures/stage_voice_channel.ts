import type { Client } from "../client.ts";
import type { channel, Snowflake } from "../../discord_typings/mod.ts";
import { PermissionOverwrite } from "./guild_channel.ts";
import { VoiceBasedChannel } from "./voice_based_channel.ts";

export class StageVoiceChannel<
  T extends channel.StageVoiceChannel = channel.StageVoiceChannel,
> extends VoiceBasedChannel<T> {
  /** The type of this channel. */
  type = "stage" as const;

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
    parentId: Snowflake | null;
    voiceRegionId?: string | null;
    automaticVideoQuality?: boolean | null;
  }, reason?: string): Promise<StageVoiceChannel> {
    return super.edit(options, reason) as Promise<StageVoiceChannel>;
  }

  /** Deletes the channel. Returns a new instance. */
  delete(reason?: string): Promise<StageVoiceChannel> {
    return super.delete(reason) as Promise<StageVoiceChannel>;
  }

  async updateCurrentUserVoiceState(suppress: boolean) {
    await this.client.rest.updateCurrentUserVoiceState(this.guildId, {
      channel_id: this.id,
      suppress,
    });
  }

  async updateUserVoiceState(userId: Snowflake, suppress: boolean) {
    await this.client.rest.updateUserVoiceState(this.guildId, userId, {
      channel_id: this.id,
      suppress,
    });
  }
}
