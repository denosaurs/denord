import { SnowflakeBase } from "./Base.ts";
import { Client } from "../Client.ts";
import type { user } from "../discord.ts";
import { ImageFormat, ImageSize, imageURLFormatter } from "../utils/utils.ts";
import { DMChannel } from "./DMChannel.ts";

export class User extends SnowflakeBase {
  username: string;
  discriminator: string;
  avatar: string | null;
  bot: boolean;
  system: boolean;
  publicFlags: number;

  constructor(client: Client, data: user.PublicUser) {
    super(client, data);

    this.username = data.username;
    this.discriminator = data.discriminator;
    this.avatar = data.avatar;
    this.bot = !!data.bot;
    this.system = !!data.system;
    this.publicFlags = data.public_flags ?? 0;
  }

  get tag() {
    return `${this.username}#${this.discriminator}`;
  }

  get mention() {
    return `<@${this.id}>`;
  }

  get defaultAvatar() {
    return +this.discriminator % 5;
  }

  defaultAvatarURL(size?: ImageSize) {
    return imageURLFormatter(`embed/avatars/${this.defaultAvatar}`, {
      format: "png",
      size,
    });
  }

  avatarURL(options: {
    format?: ImageFormat;
    size?: ImageSize;
  } = {}) {
    return this.avatar
      ? imageURLFormatter(`avatars/${this.id}/${this.avatar}`, options)
      : this.defaultAvatarURL(options.size);
  }

  async getDM() {
    if (this.client.DMChannels.has(this.id)) {
      return this.client.DMChannels.get(this.id);
    } else {
      return new DMChannel(
        this.client,
        await this.client.rest.createDM({ recipient_id: this.id }),
      );
    }
  }
}

export class PrivateUser extends User {
  email: string | null;
  flags: number;
  locale: string;
  mfaEnabled: boolean;
  phone?: string | null;
  verified: boolean;
  premiumType: 0 | 1 | 2;

  constructor(client: Client, data: user.PrivateUser) {
    super(client, data);

    this.email = data.email;
    this.flags = data.flags ?? 0;
    this.locale = data.locale;
    this.mfaEnabled = data.mfa_enabled;
    this.phone = data.phone;
    this.verified = data.verified;
    this.premiumType = data.premium_type ?? 0;
  }

  async edit(options: user.Modify) {
    const user = await this.client.rest.modifyCurrentUser(options);

    return new PrivateUser(this.client, user);
  }
}
