import type { Client } from "../client.ts";
import type { channel, Snowflake } from "../../discord_typings/mod.ts";
import {
  GuildChannel,
  PermissionOverwrite,
  unparsePermissionOverwrite,
} from "./guild_channel.ts";
import { Invite, parseInvite } from "./invite.ts";
import { VoiceChannel } from "./voice_channel.ts";
import { StageVoiceChannel } from "./stage_voice_channel.ts";

export class VoiceBasedChannel<
  T extends channel.VoiceBasedChannel = channel.VoiceBasedChannel,
> extends GuildChannel<T> {
  /** The type of this channel. */
  type: "voice" | "stage" = "voice" as const;
  /** The bitrate for this channel. */
  bitrate: number;
  /** The maximum amount of users that can be in this channel. */
  userLimit: number;
  /** The voice region id for the voice channel, null means automatic. */
  voiceRegionId?: string | null; // TODO
  /** Whether Discord chooses the quality for optimal performance or uses 720p */
  automaticVideoQuality: boolean;

  constructor(client: Client, data: T) {
    super(client, data);

    this.bitrate = data.bitrate;
    this.userLimit = data.user_limit;
    this.voiceRegionId = data.rtc_region;
    this.automaticVideoQuality = (data.video_quality_mode ?? 1) === 1;
  }

  /** Edits this channel. Returns a new instance. */
  async edit(options: {
    name?: string;
    position?: number | null;
    bitrate?: number | null;
    userLimit?: number | null;
    permissionOverwrites?: PermissionOverwrite[] | null;
    parentId?: Snowflake | null;
    voiceRegionId?: string | null;
    automaticVideoQuality?: boolean | null;
  }, reason?: string): Promise<VoiceChannel | StageVoiceChannel> {
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

    if (this.type === "voice") {
      return new VoiceChannel(this.client, channel as channel.VoiceChannel);
    } else {
      return new StageVoiceChannel(
        this.client,
        channel as channel.StageVoiceChannel,
      );
    }
  }

  /** Deletes the channel. Returns a new instance. */
  async delete(reason?: string): Promise<VoiceChannel | StageVoiceChannel> {
    const channel = await this.client.rest.deleteChannel(
      this.id,
      reason,
    );
    if (this.type === "voice") {
      return new VoiceChannel(this.client, channel as channel.VoiceChannel);
    } else {
      return new StageVoiceChannel(
        this.client,
        channel as channel.StageVoiceChannel,
      );
    }
  }

  /** Fetches the invites for this channel. */
  async getInvites(): Promise<Invite[]> {
    const invites = await this.client.rest.getChannelInvites(this.id);

    return invites.map((invite) => parseInvite(this.client, invite));
  }
}
