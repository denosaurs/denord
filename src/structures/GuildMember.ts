import { Base } from "./Base.ts";
import type { Client } from "../Client.ts";
import type { guild, guildMember, Snowflake } from "../discord.ts";
import { User } from "./User.ts";

export class GuildMember<
  T extends guildMember.GuildMember = guildMember.GuildMember,
> extends Base<T> {
  /** The user associated to this member. */
  user: User;
  /** The nickname for this member. Null if no nickname is set. */
  nickname: string | null;
  /** An array of role ids this member has. */
  roles: Snowflake[];
  /** Unix timestamp of when the member joined. */
  joinedAt: number;
  /**
   * Unix timestamp of since when the member started boosting the guild associated to it.
   * Null if the member isn't boosting the guild associated to it.
   */
  boostingSince: number | null;
  /** Whether or not this member is deafened in voice channels. */
  deaf: boolean;
  /** Whether or not this member is muted in voice channels. */
  mute: boolean;
  /** The id of the guild this user belongs to. */
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

  /** Bans the member from the guild. */
  async ban(options: guild.CreateBan): Promise<void> {
    await this.client.rest.createGuildBan(this.guildId, this.user.id, options);
  }

  /** Kicks the member from the guild. */
  async kick(reason?: string): Promise<void> {
    await this.client.rest.removeGuildMember(
      this.guildId,
      this.user.id,
      reason,
    );
  }

  /** Edits the member. */
  async edit(
    options: guildMember.Modify,
    reason?: string,
  ): Promise<GuildMember> {
    const member = await this.client.rest.modifyGuildMember(
      this.guildId,
      this.user.id,
      options,
      reason,
    );
    return new GuildMember(this.client, member, this.guildId);
  }

  /** Edits the nickname of the current user member. */
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

  /** Adds a role to the member. Returns a new instance. */
  async addRole(roleId: Snowflake, reason?: string): Promise<GuildMember> {
    await this.client.rest.addGuildMemberRole(
      this.guildId,
      this.user.id,
      roleId,
      reason,
    );

    return new GuildMember(this.client, {
      ...this.raw,
      roles: this.roles.includes(roleId) ? [...this.roles, roleId] : this.roles,
    }, this.guildId);
  }

  /** Removes a role from the member. Returns a new instance. */
  async removeRole(roleId: Snowflake, reason?: string): Promise<GuildMember> {
    await this.client.rest.removeGuildMemberRole(
      this.guildId,
      this.user.id,
      roleId,
      reason,
    );

    return new GuildMember(this.client, {
      ...this.raw,
      roles: this.roles.splice(this.roles.indexOf(roleId), 1),
    }, this.guildId);
  }
}
