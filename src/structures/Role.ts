import { SnowflakeBase } from "./Base.ts";
import type { Client } from "../Client.ts";
import type { role, Snowflake } from "../discord.ts";

export const permissionMap = {
  "createInstantInvite": 0x00000001,
  "kickMembers": 0x00000002,
  "banMembers": 0x00000004,
  "administrator": 0x00000008,
  "manageChannels": 0x00000010,
  "manageGuild": 0x00000020,
  "addReactions": 0x00000040,
  "viewAuditLog": 0x00000080,
  "prioritySpeaker": 0x00000100,
  "stream": 0x00000200,
  "viewChannel": 0x00000400,
  "sendMessages": 0x00000800,
  "sendTTSMessages": 0x00001000,
  "manageMessages": 0x00002000,
  "embedLinks": 0x00004000,
  "attachFiles": 0x00008000,
  "readMessageHistory": 0x00010000,
  "mentionEveryone": 0x00020000,
  "useExternalEmojis": 0x00040000,
  "viewGuildInsights": 0x00080000,
  "connect": 0x00100000,
  "speak": 0x00200000,
  "muteMembers": 0x00400000,
  "deafenMembers": 0x00800000,
  "moveMembers": 0x01000000,
  "useVAD": 0x02000000,
  "changeNickname": 0x04000000,
  "manageNicknames": 0x08000000,
  "manageRoles": 0x10000000,
  "manageWebhooks": 0x20000000,
  "manageEmojis": 0x40000000,
} as const;

export class Role extends SnowflakeBase {
  name: string;
  color: number;
  hoist: boolean;
  managed: boolean;
  mentionable: boolean;
  permissions = {} as Record<keyof typeof permissionMap, boolean>;
  position: number;
  guildId: Snowflake;

  constructor(client: Client, data: role.Role, guildId: Snowflake) {
    super(client, data);

    this.guildId = guildId;

    this.name = data.name;
    this.color = data.color;
    this.hoist = data.hoist;
    this.managed = data.managed;
    this.mentionable = data.mentionable;

    const permissions = BigInt(data.permissions_new);
    for (const [key, val] of Object.entries(permissionMap)) {
      const bVal = BigInt(val);
      this.permissions[key as keyof typeof permissionMap] =
        ((permissions & bVal) == bVal);
    }

    this.position = data.position;
  }

  get mention() {
    return `<@&${this.id}>`;
  }

  async delete() {
    await this.client.rest.deleteGuildRole(this.guildId, this.id);
  }

  async edit(options: {}) {
    const role = await this.client.rest.modifyGuildRole(
      this.guildId,
      this.id,
      options,
    );

    return new Role(this.client, role, this.guildId);
  }

  async moveTo(index: number) {
    await this.client.rest.modifyGuildRolePositions(this.id, [{
      id: this.id,
      position: index,
    }]);
  }
}
