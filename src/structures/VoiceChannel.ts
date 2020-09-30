import type { Client } from "../Client.ts";
import type { channel, Snowflake } from "../discord.ts";
import {
  GuildChannel,
  PermissionOverwrite,
  unparsePermissionOverwrite,
} from "./GuildChannel.ts";
import { Invite, parseInvite } from "./Invite.ts";

export class VoiceChannel<T extends channel.VoiceChannel = channel.VoiceChannel>
  extends GuildChannel<T> {
  /** The type of this channel. */
  type = "voice" as const;
  /** The bitrate for this channel. */
  bitrate: number;
  /** The maximum amount of users that can be in this channel. */
  userLimit: number;

  constructor(client: Client, data: T) {
    super(client, data);

    this.bitrate = data.bitrate;
    this.userLimit = data.user_limit;
  }

  /** Edits this channel. Returns a new instance. */
  async edit(options: {
    name?: string;
    position?: number | null;
    bitrate?: number | null;
    userLimit?: number | null;
    permissionOverwrites?: PermissionOverwrite[] | null;
    parentId: Snowflake | null;
  }, reason?: string): Promise<VoiceChannel> {
    const permissionOverwrites =
      options.permissionOverwrites?.map(({ permissions, id, type }) => {
        const { allow, deny } = unparsePermissionOverwrite(permissions);

        return {
          id,
          type,
          allow,
          deny,
        };
      }) ?? (options.permissionOverwrites as undefined | null);

    const channel = await this.client.rest.modifyChannel(this.id, {
      name: options.name,
      position: options.position,
      bitrate: options.bitrate,
      user_limit: options.userLimit,
      permission_overwrites: permissionOverwrites,
      parent_id: options.parentId,
    }, reason);

    return new VoiceChannel(this.client, channel as channel.VoiceChannel);
  }

  /** Deletes the channel. Returns a new instance. */
  async delete(reason?: string): Promise<VoiceChannel> {
    const channel = await this.client.rest.deleteChannel(
      this.id,
      reason,
    ) as channel.VoiceChannel;
    return new VoiceChannel(this.client, channel);
  }

  /** Fetches the invites for this channel. */
  async getInvites(): Promise<Invite[]> {
    const invites = await this.client.rest.getChannelInvites(this.id);

    return invites.map((invite) => parseInvite(this.client, invite));
  }

  connect(): Promise<void> {
    return this.client.voice!.connect(0, this.guildId, this.id);
  }

  disconnect(): Promise<void> {
    return this.client.voice!.disconnect(this.guildId, this.id);
  }

  speak(voiceData: ReadableStream<Uint8Array> | Uint8Array, priority = false): Promise<void> {
    return this.client.voice!.speak(this.guildId, voiceData, priority);
  }

  get connected(): boolean {
    return this.client.voice!.connections.get(this.guildId)?.channelId ===
      this.id;
  }
}
