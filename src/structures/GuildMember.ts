import { Base } from "./Base.ts";
import { Client } from "../Client.ts";
import type { guild, guildMember, Snowflake } from "../discord.ts";
import { User } from "./User.ts";

export class GuildMember extends Base {
  user: User;
  nickname: string | null;
  roles: Snowflake[];
  joinedAt: number;
  boostingSince: number | null;
  deaf: boolean;
  mute: boolean;
  guildId: Snowflake;

  constructor(
    client: Client,
    data: guildMember.GuildMember,
    guildId: Snowflake,
  ) {
    super(client, data);

    this.guildId = guildId;

    this.user = new User(client, data.user);
    this.nickname = data.nick;
    this.roles = data.roles;
    this.joinedAt = Date.parse(data.joined_at);
    this.boostingSince = data.premium_since
      ? Date.parse(data.premium_since)
      : null;
    this.deaf = data.deaf;
    this.mute = data.mute;
  }

  async ban(options: guild.CreateBan) {
    await this.client.rest.createGuildBan(this.guildId, this.user.id, options);
  }

  async kick() {
    await this.client.rest.removeGuildMember(this.guildId, this.user.id);
  }

  async modify(options: guildMember.Modify) {
    let newMember;
    const keys = Object.keys(options);
    if (
      this.client.user!.id === this.user.id &&
      (keys.length === 1 && keys[0] === "nick")
    ) {
      newMember = await this.client.rest.modifyCurrentUserNick(
        this.guildId,
        this.user.id,
        options,
      );
    } else {
      newMember = await this.client.rest.modifyGuildMember(
        this.guildId,
        this.user.id,
        options,
      );
    }

    return new GuildMember(this.client, newMember, this.guildId);
  }

  async addRole(roleId: Snowflake) {
    await this.client.rest.addGuildMemberRole(
      this.guildId,
      this.user.id,
      roleId,
    );
  }

  async removeRole(roleId: Snowflake) {
    await this.client.rest.removeGuildMemberRole(
      this.guildId,
      this.user.id,
      roleId,
    );
  }
}
