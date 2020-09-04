import { SnowflakeBase } from "./Base.ts";
import { Client } from "../Client.ts";
import type { role, Snowflake } from "../discord.ts";

const permissionMap = {
  [0x00000001]: "createInstantInvite",
  [0x00000002]: "kickMembers",
  [0x00000004]: "banMembers",
  [0x00000008]: "administrator",
  [0x00000010]: "manageChannels",
  [0x00000020]: "manageGuild",
  [0x00000040]: "addReactions",
  [0x00000080]: "viewAuditLog",
  [0x00000100]: "prioritySpeaker",
  [0x00000200]: "stream",
  [0x00000400]: "viewChannel",
  [0x00000800]: "sendMessages",
  [0x00001000]: "sendTTSMessages",
  [0x00002000]: "manageMessages",
  [0x00004000]: "embedLinks",
  [0x00008000]: "attachFiles",
  [0x00010000]: "readMessageHistory",
  [0x00020000]: "mentionEveryone",
  [0x00040000]: "useExternalEmojis",
  [0x00080000]: "viewGuildInsights",
  [0x00100000]: "connect",
  [0x00200000]: "speak",
  [0x00400000]: "muteMembers",
  [0x00800000]: "deafenMembers",
  [0x01000000]: "moveMembers",
  [0x02000000]: "useVAD",
  [0x04000000]: "changeNickname",
  [0x08000000]: "manageNicknames",
  [0x10000000]: "manageRoles",
  [0x20000000]: "manageWebhooks",
  [0x40000000]: "manageEmojis",
} as const;

export class Role extends SnowflakeBase {
  name: string;
  color: number;
  hoist: boolean;
  managed: boolean;
  mentionable: boolean;
  permissions: (typeof permissionMap[keyof typeof permissionMap])[];
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

    const permissionsArray:
      (typeof permissionMap[keyof typeof permissionMap])[] = [];
    const permissions = BigInt(data.permissions_new);
    for (const [key, val] of Object.entries(permissionMap)) {
      const bKey = BigInt(key);
      if ((permissions & bKey) == bKey) {
        permissionsArray.push(val);
      }
    }
    this.permissions = permissionsArray;

    this.position = data.position;
  }

  get mention() {
    return `<@&${this.id}>`;
  }

  async delete() {
    await this.client.rest.deleteGuildRole(this.guildId, this.id);
  }

  async edit(options: role.Modify = {}) {
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
