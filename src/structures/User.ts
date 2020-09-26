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
  /** The username of the user. */
  username: string;
  /** The discriminator of the user. */
  discriminator: string;
  /** The avatar hash of the user. Null if the user doesn't have an avatar. */
  avatar: string | null;
  /** Whether or not this user is a bot. */
  bot: boolean;
  /** Whether or not this user is an Official Discord System user. */
  system: boolean;
  /**
   * An object of public flags the user can have.
   * If the user has a public flag, that public flag is set to true.
   */
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

  /** The tag (username#discrimintor) of the user. */
  get tag(): string {
    return `${this.username}#${this.discriminator}`;
  }

  /** The string that mentions the user. */
  get mention(): string {
    return `<@!${this.id}>`;
  }

  /** The default avatar identifier. */
  get defaultAvatar(): number {
    return +this.discriminator % 5;
  }

  /** Returns the url for the default avatar. */
  defaultAvatarURL(size?: ImageSize): string {
    return imageURLFormatter(`embed/avatars/${this.defaultAvatar}`, {
      format: "png",
      size,
    });
  }

  /** Returns the url for the avatar. Returns the default avatar url if the user doesn't have an avatar. */
  avatarURL(options: {
    format?: ImageFormat;
    size?: ImageSize;
  } = {}): string {
    return this.avatar
      ? imageURLFormatter(`avatars/${this.id}/${this.avatar}`, options)
      : this.defaultAvatarURL(options.size);
  }

  /** Gets the dm channel for this user. */
  async getDM(): Promise<DMChannel> {
    return (this.client.dmChannels.get(this.id) as DMChannel | undefined) ??
      new DMChannel(
        this.client,
        await this.client.rest.createDM({ recipient_id: this.id }),
      );
  }
}

export class PrivateUser<T extends user.PrivateUser = user.PrivateUser>
  extends User<T> {
  /** The email for this user. Null if no email is set. */
  email: string | null;
  /**
   * An object of flags the user can have.
   * If the user has a flag, that flag is set to true.
   */
  flags = {} as Record<keyof typeof flagsMap, boolean>;
  /** The locale for this user. */
  locale: string;
  /** Whether or not this user has MFA enabled. */
  mfaEnabled: boolean;
  /** Whether or not this user is verified. */
  verified: boolean;
  /** The level of nitro the user has. */
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

  /** Edits the user. Returns a new instance. */
  async edit(options: user.Modify): Promise<PrivateUser> {
    const user = await this.client.rest.modifyCurrentUser(options);

    return new PrivateUser(this.client, user);
  }
}
