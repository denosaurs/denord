import { SnowflakeBase } from "./Base.ts";
import type { Client } from "../Client.ts";
import type { user } from "../discord.ts";
import { ImageFormat, ImageSize, imageURLFormatter } from "../utils/utils.ts";
import { DMChannel } from "./DMChannel.ts";

const flagsMap = {
  "discordEmployee": 0x00001,
  "partneredServerOwner": 0x00002,
  "hypeSquadEvents": 0x00004,
  "bugHunterLevel1": 0x00008,
  "houseBravery": 0x00040,
  "houseBrilliance": 0x00080,
  "houseBalance": 0x00100,
  "earlySupporter": 0x00200,
  "teamUser": 0x00400,
  "system": 0x01000,
  "bugHunterLevel2": 0x04000,
  "verifiedBot": 0x10000,
  "earlyVerifiedBotDeveloper": 0x20000,
} as const;

export class User<T extends user.PublicUser = user.PublicUser>
  extends SnowflakeBase<T> {
  username: string;
  discriminator: string;
  avatar: string | null;
  bot: boolean;
  system: boolean;
  publicFlags = {} as Record<keyof typeof flagsMap, boolean>;

  constructor(client: Client, data: T) {
    super(client, data);

    this.username = data.username;
    this.discriminator = data.discriminator;
    this.avatar = data.avatar;
    this.bot = !!data.bot;
    this.system = !!data.system;

    const flags = data.public_flags ?? 0;
    for (const [key, val] of Object.entries(flagsMap)) {
      this.publicFlags[key as keyof typeof flagsMap] = ((flags & val) === val);
    }
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
    if (this.client.dmChannels.has(this.id)) {
      return this.client.dmChannels.get(this.id);
    } else {
      return new DMChannel(
        this.client,
        await this.client.rest.createDM({ recipient_id: this.id }),
      );
    }
  }
}

export class PrivateUser<T extends user.PrivateUser = user.PrivateUser>
  extends User<T> {
  email: string | null;
  flags = {} as Record<keyof typeof flagsMap, boolean>;
  locale: string;
  mfaEnabled: boolean;
  verified: boolean;
  premiumType: 0 | 1 | 2;

  constructor(client: Client, data: T) {
    super(client, data);

    this.email = data.email;
    this.locale = data.locale;
    this.mfaEnabled = data.mfa_enabled;
    this.verified = data.verified;
    this.premiumType = data.premium_type ?? 0;

    const flags = data.flags ?? 0;
    for (const [key, val] of Object.entries(flagsMap)) {
      this.flags[key as keyof typeof flagsMap] = ((flags & val) === val);
    }
  }

  async edit(options: user.Modify) {
    const user = await this.client.rest.modifyCurrentUser(options);

    return new PrivateUser(this.client, user);
  }
}
