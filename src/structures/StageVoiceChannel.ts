import type { Client } from "../Client.ts";
import type { channel, Snowflake } from "../discord/mod.ts";
import { VoiceChannel } from "./VoiceChannel.ts";
import {
  PermissionOverwrite,
  unparsePermissionOverwrite,
} from "./GuildChannel.ts";

export class StageVoiceChannel<
  T extends channel.StageVoiceChannel = channel.StageVoiceChannel,
> extends // @ts-ignore
VoiceChannel<T> {
  /** The type of this channel. */
  // @ts-ignore
  type = "stage" as const;

  constructor(client: Client, data: T) {
    super(client, data);
  }

  /** Edits this channel. Returns a new instance. */
  // @ts-ignore
  async edit(options: {
    name?: string;
    position?: number | null;
    bitrate?: number | null;
    userLimit?: number | null;
    permissionOverwrites?: PermissionOverwrite[] | null;
    parentId: Snowflake | null;
    voiceRegionId?: string | null;
    automaticVideoQuality?: boolean | null;
  }, reason?: string): Promise<StageVoiceChannel> {
    const permissionOverwrites: channel.Overwrite[] | null | undefined =
      options.permissionOverwrites?.map(({ permissions, id, type }) => {
        const { allow, deny } = unparsePermissionOverwrite(permissions);

        return {
          id,
          type: type === "member" ? 1 : 0,
          allow,
          deny,
        };
      }) ?? (options.permissionOverwrites as undefined | null);

    let videoQualityMode: 1 | 2 | undefined | null;
    if (typeof options.automaticVideoQuality === "boolean") {
      videoQualityMode = options.automaticVideoQuality ? 1 : 2;
    } else {
      videoQualityMode = options.automaticVideoQuality;
    }

    const channel = await this.client.rest.modifyChannel(this.id, {
      name: options.name,
      position: options.position,
      bitrate: options.bitrate,
      user_limit: options.userLimit,
      permission_overwrites: permissionOverwrites,
      parent_id: options.parentId,
      rtc_region: options.voiceRegionId,
      video_quality_mode: videoQualityMode,
    }, reason);

    return new StageVoiceChannel(
      this.client,
      channel as channel.StageVoiceChannel,
    );
  }

  /** Deletes the channel. Returns a new instance. */
  // @ts-ignore
  async delete(reason?: string): Promise<StageVoiceChannel> {
    const channel = await this.client.rest.deleteChannel(
      this.id,
      reason,
    ) as channel.StageVoiceChannel;
    return new StageVoiceChannel(this.client, channel);
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
