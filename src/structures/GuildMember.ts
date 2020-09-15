import { Base } from "./Base.ts";
import type { Client } from "../Client.ts";
import type { guild, guildMember, Snowflake } from "../discord.ts";
import { User } from "./User.ts";

export class GuildMember<
  T extends guildMember.GuildMember = guildMember.GuildMember,
> extends Base<T> {
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
    data: T,
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

  async ban(options: guild.CreateBan): Promise<void> {
    await this.client.rest.createGuildBan(this.guildId, this.user.id, options);
  }

  async kick(reason?: string): Promise<void> {
    await this.client.rest.removeGuildMember(
      this.guildId,
      this.user.id,
      reason,
    );
  }

  async edit(options: guildMember.Modify, reason?: string): Promise<GuildMember> {
    const member = await this.client.rest.modifyGuildMember(
      this.guildId,
      this.user.id,
      options,
      reason,
    );
    return new GuildMember(this.client, member, this.guildId);
  }

  async editCurrentNick(nickname: string | null): Promise<GuildMember> {
    const nick = await this.client.rest.modifyCurrentUserNick(
      this.guildId,
      { nick: nickname },
    );
    return new GuildMember(this.client, {
      ...this.raw,
      ...nick,
    }, this.guildId);
  }

  async addRole(roleId: Snowflake, reason?: string): Promise<void> {
    await this.client.rest.addGuildMemberRole(
      this.guildId,
      this.user.id,
      roleId,
      reason,
    );
  }

  async removeRole(roleId: Snowflake, reason?: string): Promise<void> {
    await this.client.rest.removeGuildMemberRole(
      this.guildId,
      this.user.id,
      roleId,
      reason,
    );
  }
}
