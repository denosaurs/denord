import { SnowflakeBase } from "./Base.ts";
import type { Client } from "../Client.ts";
import type { role, Snowflake } from "../discord.ts";

export const permissionMap = {
  "createInstantInvite": 0x000000001,
  "kickMembers": 0x000000002,
  "banMembers": 0x000000004,
  "administrator": 0x000000008,
  "manageChannels": 0x000000010,
  "manageGuild": 0x000000020,
  "addReactions": 0x000000040,
  "viewAuditLog": 0x000000080,
  "prioritySpeaker": 0x000000100,
  "stream": 0x000000200,
  "viewChannel": 0x000000400,
  "sendMessages": 0x000000800,
  "sendTTSMessages": 0x000001000,
  "manageMessages": 0x000002000,
  "embedLinks": 0x000004000,
  "attachFiles": 0x000008000,
  "readMessageHistory": 0x000010000,
  "mentionEveryone": 0x000020000,
  "useExternalEmojis": 0x000040000,
  "viewGuildInsights": 0x000080000,
  "connect": 0x000100000,
  "speak": 0x000200000,
  "muteMembers": 0x000400000,
  "deafenMembers": 0x000800000,
  "moveMembers": 0x001000000,
  "useVAD": 0x002000000,
  "changeNickname": 0x004000000,
  "manageNicknames": 0x008000000,
  "manageRoles": 0x010000000,
  "manageWebhooks": 0x020000000,
  "manageEmojis": 0x040000000,
  "useSlashCommands": 0x080000000,
  "requestToSpeak": 0x100000000,
} as const;

export class Role<T extends role.Role = role.Role> extends SnowflakeBase<T> {
  /** The name of the role. */
  name: string;
  /** The color of the role. */
  color: number;
  /** Whether or not the role is separated in the member list. */
  hoist: boolean;
  /** Whether or not the role is controlled by an integration. */
  managed: boolean;
  /** Whether or not the role can be mentioned. */
  mentionable: boolean;
  /**
   * An object of permissions the role can have.
   * If the role has a permission, that permission is set to true.
   */
  permissions = {} as Record<keyof typeof permissionMap, boolean>;
  /** The position of the role in the role list. */
  position: number;
  /** The id of the guild this role belongs to. */
  guildId: Snowflake;
  /** Additional possible tags */
  tags: {
    botId?: Snowflake;
    integrationId?: Snowflake;
    boost: boolean;
  };

  constructor(client: Client, data: T, guildId: Snowflake) {
    super(client, data);

    this.guildId = guildId;

    this.name = data.name;
    this.color = data.color;
    this.hoist = data.hoist;
    this.managed = data.managed;
    this.mentionable = data.mentionable;

    const permissions = BigInt(data.permissions);
    for (const [key, val] of Object.entries(permissionMap)) {
      const bVal = BigInt(val);
      this.permissions[key as keyof typeof permissionMap] =
        ((permissions & bVal) == bVal);
    }

    this.position = data.position;
    this.tags = {
      botId: data.tags?.bot_id,
      integrationId: data.tags?.integration_id,
      boost: data.tags?.premium_subscriber === null,
    };
  }

  /** The string that mentions the role. */
  get mention(): string {
    return `<@&${this.id}>`;
  }

  /** Deletes the role. */
  async delete(reason?: string): Promise<void> {
    await this.client.rest.deleteGuildRole(this.guildId, this.id, reason);
  }

  /** Edits the role. */
  async edit(options: Record<string, unknown>, reason?: string): Promise<Role> {
    const role = await this.client.rest.modifyGuildRole(
      this.guildId,
      this.id,
      options,
      reason,
    );

    return new Role(this.client, role, this.guildId);
  }

  /** Moves the role. */
  async moveTo(index: number): Promise<void> {
    await this.client.rest.modifyGuildRolePositions(this.id, [{
      id: this.id,
      position: index,
    }]);
  }
}
