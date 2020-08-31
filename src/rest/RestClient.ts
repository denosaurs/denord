import type * as Discord from "../discord.ts";
import { stringifyQueryParams as stringify, URLs } from "../utils/utils.ts";
import { DiscordJSONError, HTTPError } from "./Error.ts";

/**
 * A client to make HTTP requests to Discord
 * NOTE: There are no explanations what each of the methods do as they are identical to Discord's endpoints.
 * Only endpoint not included is "Get Guild Widget Image"
 * */
export class RestClient {
  /** The token to make requests with */
  token: string;

  /**
   * @param token - The token to make requests with
   */
  constructor(token?: string) {
    this.token = token ?? "";
  }

  private async request(
    endpoint: string,
    method: ("GET" | "POST" | "PUT" | "PATCH" | "DELETE"),
    data?: any,
  ): Promise<unknown> {
    const headers = new Headers({
      "User-Agent": "DiscordBot (https://github.com/denosaurs/denord, 0.0.1)",
    });

    if (this.token) {
      headers.append("Authorization", "Bot " + this.token);
    }

    let body;

    if (data !== undefined) {
      if (data.file) {
        let { file, ...otherData } = data;

        data = new FormData();
        data.append("file", file, file.name);
        data.append("payload_json", otherData);
        body = data;
      } else {
        headers.set("Content-Type", "application/json");
        body = JSON.stringify(data);
      }
    }

    const res = await fetch(URLs.REST + endpoint, {
      method,
      headers,
      body,
    });

    switch (res.status) {
      case 200:
      case 201:
        return res.json();

      case 204:
        return;

      case 400:
      case 404:
        throw new DiscordJSONError(res.status, await res.json());

      case 401:
        throw new HTTPError(res.status, "You supplied an invalid token");

      case 403:
        throw new HTTPError(res.status, "You don't have permission to do this");

      case 429:
        throw new HTTPError(res.status, "You are getting rate-limited");

      case 502:
        throw new HTTPError(res.status, "Gateway unavailable. Wait and retry");

      case 500:
      case 503:
      case 504:
      case 507:
      case 508:
        throw new HTTPError(res.status, "Discord internal error");

      default:
        throw new HTTPError(res.status, "Unexpected response");
    }
  }

  //region Audit Log
  async getGuildAuditLog(
    guildId: Discord.Snowflake,
  ): Promise<Discord.auditLog.AuditLog> {
    return this.request(
      `guilds/${guildId}/audit-logs`,
      "GET",
    ) as Promise<Discord.auditLog.AuditLog>;
  }

  //endregion

  //region Channel
  async getChannel(
    channelId: Discord.Snowflake,
  ): Promise<Discord.channel.Channel> {
    return this.request(
      `channels/${channelId}`,
      "GET",
    ) as Promise<Discord.channel.Channel>;
  }

  async modifyChannel(
    channelId: Discord.Snowflake,
    data: Discord.channel.Modify,
  ): Promise<Discord.channel.Channel> {
    return this.request(
      `channels/${channelId}`,
      "PATCH",
      data,
    ) as Promise<Discord.channel.Channel>;
  }

  async deleteChannel(
    channelId: Discord.Snowflake,
  ): Promise<Discord.channel.Channel> {
    return this.request(
      `channels/${channelId}`,
      "DELETE",
    ) as Promise<Discord.channel.Channel>;
  }

  async getChannelMessages(
    channelId: Discord.Snowflake,
    params: Discord.channel.GetMessages,
  ): Promise<Discord.message.Message[]> {
    return this.request(
      `channels/${channelId}/messages${stringify(params)}`,
      "GET",
    ) as Promise<Discord.message.Message[]>;
  }

  async getChannelMessage(
    channelId: Discord.Snowflake,
    messageId: Discord.Snowflake,
  ): Promise<Discord.message.Message> {
    return this.request(
      `channels/${channelId}/messages/${messageId}`,
      "GET",
    ) as Promise<Discord.message.Message>;
  }

  async createMessage(
    channelId: Discord.Snowflake,
    data: Discord.message.Create,
  ): Promise<Discord.message.Message> {
    return this.request(
      `channels/${channelId}/messages`,
      "POST",
      data,
    ) as Promise<Discord.message.Message>;
  }

  async createReaction(
    channelId: Discord.Snowflake,
    messageId: Discord.Snowflake,
    emoji: string,
  ): Promise<void> {
    await this.request(
      `channels/${channelId}/messages/${messageId}/reactions/${emoji}/@me`,
      "PUT",
    );
  }

  async deleteOwnReaction(
    channelId: Discord.Snowflake,
    messageId: Discord.Snowflake,
    emoji: string,
  ): Promise<void> {
    await this.request(
      `channels/${channelId}/messages/${messageId}/reactions/${emoji}/@me`,
      "DELETE",
    );
  }

  async deleteUserReaction(
    channelId: Discord.Snowflake,
    messageId: Discord.Snowflake,
    emoji: string,
    userId: Discord.Snowflake,
  ): Promise<void> {
    await this.request(
      `channels/${channelId}/messages/${messageId}/${emoji}/reactions/${userId}`,
      "DELETE",
    );
  }

  async getReactions(
    channelId: Discord.Snowflake,
    messageId: Discord.Snowflake,
    emoji: string,
    params: Discord.channel.GetReactions,
  ): Promise<Discord.user.User[]> {
    return this.request(
      `channels/${channelId}/messages/${messageId}/reactions/${emoji}${
        stringify(params)
      }`,
      "GET",
    ) as Promise<Discord.user.User[]>;
  }

  async deleteAllReactions(
    channelId: Discord.Snowflake,
    messageId: Discord.Snowflake,
  ): Promise<void> {
    await this.request(
      `channels/${channelId}/messages/${messageId}/reactions`,
      "DELETE",
    );
  }

  async deleteAllReactionsForEmoji(
    channelId: Discord.Snowflake,
    messageId: Discord.Snowflake,
    emoji: string,
  ): Promise<void> {
    await this.request(
      `channels/${channelId}/messages/${messageId}/reactions/${emoji}`,
      "DELETE",
    );
  }

  async editMessage(
    channelId: Discord.Snowflake,
    messageId: Discord.Snowflake,
    data: Discord.message.Edit,
  ): Promise<Discord.message.Message> {
    return this.request(
      `channels/${channelId}/messages/${messageId}`,
      "PATCH",
      data,
    ) as Promise<Discord.message.Message>;
  }

  async deleteMessage(
    channelId: Discord.Snowflake,
    messageId: Discord.Snowflake,
  ): Promise<void> {
    await this.request(`channels/${channelId}/messages/${messageId}`, "DELETE");
  }

  async bulkDeleteMessages(
    channelId: Discord.Snowflake,
    data: Discord.channel.BulkDelete,
  ): Promise<void> {
    await this.request(
      `channels/${channelId}/messages/bulk-delete`,
      "POST",
      data,
    );
  }

  async editChannelPermissions(
    channelId: Discord.Snowflake,
    overwriteId: Discord.Snowflake,
    data: Omit<Discord.channel.Overwrite, "id">,
  ): Promise<void> {
    await this.request(
      `channels/${channelId}/permissions/${overwriteId}`,
      "PUT",
      data,
    );
  }

  async getChannelInvites(
    channelId: Discord.Snowflake,
  ): Promise<Discord.invite.Invite[]> {
    return this.request(
      `channels/${channelId}/invites`,
      "GET",
    ) as Promise<Discord.invite.Invite[]>;
  }

  async createChannelInvite(
    channelId: Discord.Snowflake,
    data: Discord.invite.Create,
  ): Promise<Discord.invite.Invite> {
    return this.request(
      `channels/${channelId}/invites`,
      "POST",
      data,
    ) as Promise<Discord.invite.Invite>;
  }

  async deleteChannelPermission(
    channelId: Discord.Snowflake,
    overwriteId: Discord.Snowflake,
  ): Promise<void> {
    await this.request(
      `channels/${channelId}/permissions/${overwriteId}`,
      "DELETE",
    );
  }

  async triggerTypingIndicator(channelId: Discord.Snowflake): Promise<void> {
    await this.request(`channels/${channelId}/typing`, "POST");
  }

  async getPinnedMessages(
    channelId: Discord.Snowflake,
  ): Promise<Discord.message.Message[]> {
    return this.request(
      `channels/${channelId}/pins`,
      "GET",
    ) as Promise<Discord.message.Message[]>;
  }

  async addPinnedChannelMessage(
    channelId: Discord.Snowflake,
    messageId: Discord.Snowflake,
  ): Promise<void> {
    await this.request(`channels/${channelId}/pins/${messageId}`, "PUT");
  }

  async deletePinnedChannelMessage(
    channelId: Discord.Snowflake,
    messageId: Discord.Snowflake,
  ): Promise<void> {
    await this.request(`channels/${channelId}/pins/${messageId}`, "DELETE");
  }

  async groupDMAddRecipient(
    channelId: Discord.Snowflake,
    userId: Discord.Snowflake,
    data: Discord.channel.GroupDMAddRecipient,
  ): Promise<void> {
    await this.request(
      `channels/${channelId}/recipients/${userId}`,
      "PUT",
      data,
    );
  }

  async groupDMRemoveRecipient(
    channelId: Discord.Snowflake,
    userId: Discord.Snowflake,
  ): Promise<void> {
    await this.request(`channels/${channelId}/recipients/${userId}`, "DELETE");
  }

  //endregion

  //region Emoji
  async listGuildEmojis(
    guildId: Discord.Snowflake,
  ): Promise<Discord.emoji.Emoji[]> {
    return this.request(
      `guilds/${guildId}/emojis`,
      "GET",
    ) as Promise<Discord.emoji.Emoji[]>;
  }

  async getGuildEmoji(
    guildId: Discord.Snowflake,
    emojiId: Discord.Snowflake,
  ): Promise<Discord.emoji.Emoji> {
    return this.request(
      `guilds/${guildId}/emojis/${emojiId}`,
      "GET",
    ) as Promise<Discord.emoji.Emoji>;
  }

  async createGuildEmoji(
    guildId: Discord.Snowflake,
    data: Discord.emoji.Create,
  ): Promise<Discord.emoji.Emoji> {
    return this.request(
      `guilds/${guildId}/emojis`,
      "POST",
      data,
    ) as Promise<Discord.emoji.Emoji>;
  }

  async modifyGuildEmoji(
    guildId: Discord.Snowflake,
    emojiId: Discord.Snowflake,
    data: Discord.emoji.Modify,
  ): Promise<Discord.emoji.Emoji> {
    return this.request(
      `guilds/${guildId}/emojis/${emojiId}`,
      "PATCH",
      data,
    ) as Promise<Discord.emoji.Emoji>;
  }

  async deleteGuildEmoji(
    guildId: Discord.Snowflake,
    emojiId: Discord.Snowflake,
  ): Promise<void> {
    await this.request(`guilds/${guildId}/emojis/${emojiId}`, "DELETE");
  }

  //endregion

  //region Guild
  async createGuild(data: Discord.guild.Create): Promise<Discord.guild.Guild> {
    return this.request("guilds", "POST", data) as Promise<Discord.guild.Guild>;
  }

  async getGuild(guildId: Discord.Snowflake): Promise<Discord.guild.Guild> {
    return this.request(
      `guilds/${guildId}`,
      "GET",
    ) as Promise<Discord.guild.Guild>;
  }

  async modifyGuild(
    guildId: Discord.Snowflake,
    data: Discord.guild.Modify,
  ): Promise<Discord.guild.Guild> {
    return this.request(
      `guilds/${guildId}`,
      "PATCH",
      data,
    ) as Promise<Discord.guild.Guild>;
  }

  async deleteGuild(guildId: Discord.Snowflake): Promise<void> {
    await this.request(`guilds/${guildId}`, "DELETE");
  }

  async getGuildChannels(
    guildId: Discord.Snowflake,
  ): Promise<Discord.channel.Channel[]> {
    return this.request(
      `guilds/${guildId}/channels`,
      "GET",
    ) as Promise<Discord.channel.Channel[]>;
  }

  async createGuildChannel(
    guildId: Discord.Snowflake,
    data: Discord.channel.CreateGuildChannel,
  ): Promise<Discord.channel.Channel> {
    return this.request(
      `guilds/${guildId}/channels`,
      "POST",
      data,
    ) as Promise<Discord.channel.Channel>;
  }

  async modifyGuildChannelPositions(
    guildId: Discord.Snowflake,
    data: Discord.channel.GuildPosition,
  ): Promise<Discord.channel.Channel[]> {
    return this.request(
      `guilds/${guildId}/channels`,
      "PATCH",
      data,
    ) as Promise<Discord.channel.Channel[]>;
  }

  async getGuildMember(
    guildId: Discord.Snowflake,
    userId: Discord.Snowflake,
  ): Promise<Discord.guildMember.GuildMember> {
    return this.request(
      `guilds/${guildId}/members/${userId}`,
      "GET",
    ) as Promise<Discord.guildMember.GuildMember>;
  }

  async listGuildMembers(
    guildId: Discord.Snowflake,
    params: Discord.guildMember.List,
  ): Promise<Discord.guildMember.GuildMember[]> {
    return this.request(
      `guilds/${guildId}/members${stringify(params)}`,
      "GET",
    ) as Promise<Discord.guildMember.GuildMember[]>;
  }

  async addGuildMember(
    guildId: Discord.Snowflake,
    userId: Discord.Snowflake,
    data: Discord.guildMember.Add,
  ): Promise<Discord.guildMember.GuildMember> {
    return this.request(
      `guilds/${guildId}/members/${userId}`,
      "PUT",
      data,
    ) as Promise<Discord.guildMember.GuildMember>;
  }

  async modifyGuildMember(
    guildId: Discord.Snowflake,
    userId: Discord.Snowflake,
    data: Discord.guildMember.Modify,
  ): Promise<Discord.guildMember.GuildMember> {
    return this.request(
      `guilds/${guildId}/members/${userId}`,
      "PATCH",
      data,
    ) as Promise<Discord.guildMember.GuildMember>;
  }

  async modifyCurrentUserNick(
    guildId: Discord.Snowflake,
    userId: Discord.Snowflake,
    data: Discord.guildMember.ModifyCurrentNick,
  ): Promise<Discord.guildMember.GuildMember> {
    return this.request(
      `guilds/${guildId}/members/@me/nick`,
      "PATCH",
      data,
    ) as Promise<Discord.guildMember.GuildMember>;
  }

  async addGuildMemberRole(
    guildId: Discord.Snowflake,
    userId: Discord.Snowflake,
    roleId: Discord.Snowflake,
  ): Promise<void> {
    await this.request(
      `guilds/${guildId}/members/${userId}/roles/${roleId}`,
      "PUT",
    );
  }

  async removeGuildMemberRole(
    guildId: Discord.Snowflake,
    userId: Discord.Snowflake,
    roleId: Discord.Snowflake,
  ): Promise<void> {
    await this.request(
      `guilds/${guildId}/members/${userId}/roles/${roleId}`,
      "DELETE",
    );
  }

  async removeGuildMember(
    guildId: Discord.Snowflake,
    userId: Discord.Snowflake,
  ): Promise<void> {
    await this.request(`guilds/${guildId}/members/${userId}`, "DELETE");
  }

  async getGuildBans(guildId: Discord.Snowflake): Promise<Discord.guild.Ban[]> {
    return this.request(
      `guilds/${guildId}/bans`,
      "GET",
    ) as Promise<Discord.guild.Ban[]>;
  }

  async getGuildBan(
    guildId: Discord.Snowflake,
    userId: Discord.Snowflake,
  ): Promise<Discord.guild.Ban> {
    return this.request(
      `guilds/${guildId}/bans/${userId}`,
      "GET",
    ) as Promise<Discord.guild.Ban>;
  }

  async createGuildBan(
    guildId: Discord.Snowflake,
    userId: Discord.Snowflake,
    params: Discord.guild.CreateBan,
  ): Promise<void> {
    await this.request(
      `guilds/${guildId}/bans/${userId}${stringify(params)}`,
      "PUT",
    );
  }

  async removeGuildBan(
    guildId: Discord.Snowflake,
    userId: Discord.Snowflake,
  ): Promise<void> {
    await this.request(`guilds/${guildId}/bans/${userId}`, "DELETE");
  }

  async getGuildRoles(
    guildId: Discord.Snowflake,
  ): Promise<Discord.role.Role[]> {
    return this.request(
      `guilds/${guildId}/roles`,
      "GET",
    ) as Promise<Discord.role.Role[]>;
  }

  async createGuildRole(
    guildId: Discord.Snowflake,
    data: Discord.role.Create,
  ): Promise<Discord.role.Role> {
    return this.request(
      `guilds/${guildId}/roles`,
      "POST",
      data,
    ) as Promise<Discord.role.Role>;
  }

  async modifyGuildRolePositions(
    guildId: Discord.Snowflake,
    data: Discord.role.ModifyPosition,
  ): Promise<Discord.role.Role[]> {
    return this.request(
      `guilds/${guildId}/roles`,
      "PATCH",
      data,
    ) as Promise<Discord.role.Role[]>;
  }

  async modifyGuildRole(
    guildId: Discord.Snowflake,
    data: Discord.role.Modify,
  ): Promise<Discord.role.Role> {
    return this.request(
      `guilds/${guildId}/roles`,
      "PATCH",
      data,
    ) as Promise<Discord.role.Role>;
  }

  async deleteGuildRole(
    guildId: Discord.Snowflake,
    roleId: Discord.Snowflake,
  ): Promise<void> {
    await this.request(`guilds/${guildId}/roles/${roleId}`, "DELETE");
  }

  async getGuildPruneCount(
    guildId: Discord.Snowflake,
    params: Discord.guild.PruneCount,
  ): Promise<void> {
    await this.request(`guilds/${guildId}/prune${stringify(params)}`, "GET");
  }

  async beginGuildPrune(
    guildId: Discord.Snowflake,
    params: Discord.guild.BeginPruneParams,
  ): Promise<Discord.guild.BeginPrune> {
    return this.request(
      `guilds/${guildId}/prune${stringify(params)}`,
      "POST",
    ) as Promise<Discord.guild.BeginPrune>;
  }

  async getGuildVoiceRegions(
    guildId: Discord.Snowflake,
  ): Promise<Discord.voice.Region[]> {
    return this.request(
      `guilds/${guildId}/regions`,
      "GET",
    ) as Promise<Discord.voice.Region[]>;
  }

  async getGuildInvites(
    guildId: Discord.Snowflake,
  ): Promise<Discord.invite.MetadataInvite> {
    return this.request(
      `guilds/${guildId}/invites`,
      "GET",
    ) as Promise<Discord.invite.MetadataInvite>;
  }

  async getGuildIntegrations(
    guildId: Discord.Snowflake,
  ): Promise<Discord.integration.Integration[]> {
    return this.request(
      `guilds/${guildId}/integrations`,
      "GET",
    ) as Promise<Discord.integration.Integration[]>;
  }

  async createGuildIntegration(
    guildId: Discord.Snowflake,
    data: Discord.integration.Create,
  ): Promise<void> {
    await this.request(`guilds/${guildId}/integrations`, "POST", data);
  }

  async modifyGuildIntegration(
    guildId: Discord.Snowflake,
    integrationId: Discord.Snowflake,
    data: Discord.integration.Modify,
  ): Promise<void> {
    await this.request(
      `guilds/${guildId}/integrations/${integrationId}`,
      "PATCH",
      data,
    );
  }

  async deleteGuildIntegration(
    guildId: Discord.Snowflake,
    integrationId: Discord.Snowflake,
  ): Promise<void> {
    await this.request(
      `guilds/${guildId}/integrations/${integrationId}`,
      "DELETE",
    );
  }

  async syncGuildIntegration(
    guildId: Discord.Snowflake,
    integrationId: Discord.Snowflake,
  ): Promise<void> {
    await this.request(
      `guilds/${guildId}/integrations/${integrationId}/sync`,
      "POST",
    );
  }

  async getGuildEmbed(
    guildId: Discord.Snowflake,
  ): Promise<Discord.guild.Embed> {
    return this.request(
      `guilds/${guildId}/embed`,
      "GET",
    ) as Promise<Discord.guild.Embed>;
  }

  async modifyGuildEmbed(
    guildId: Discord.Snowflake,
    data: Discord.guild.EmbedModify,
  ): Promise<Discord.guild.Embed> {
    return this.request(
      `guilds/${guildId}/embed`,
      "PATCH",
      data,
    ) as Promise<Discord.guild.Embed>;
  }

  async getGuildVanityURL(
    guildId: Discord.Snowflake,
  ): Promise<Discord.invite.VanityURL> {
    return this.request(
      `guilds/${guildId}/vanity-url`,
      "GET",
    ) as Promise<Discord.invite.VanityURL>;
  }

  //endregion

  //region Invite
  async getInvite(inviteCode: string): Promise<Discord.invite.Invite> {
    return this.request(
      `invites/${inviteCode}`,
      "GET",
    ) as Promise<Discord.invite.Invite>;
  }

  async deleteInvite(inviteCode: string): Promise<Discord.invite.Invite> {
    return this.request(
      `invites/${inviteCode}`,
      "DELETE",
    ) as Promise<Discord.invite.Invite>;
  }

  //endregion

  //region User
  async getCurrentUser(): Promise<Discord.user.User> {
    return this.request("users/@me", "GET") as Promise<Discord.user.User>;
  }

  async getUser(userId: Discord.Snowflake): Promise<Discord.user.User> {
    return this.request(`users/${userId}`, "GET") as Promise<Discord.user.User>;
  }

  async modifyCurrentUser(
    data: Discord.user.Modify,
  ): Promise<Discord.user.User> {
    return this.request("users/@me", "PATCH", data) as Promise<
      Discord.user.User
    >;
  }

  async getCurrentUserGuilds(
    params: Discord.user.GetGuilds,
  ): Promise<Discord.guild.Guild[]> {
    return this.request(
      `users/@me/guilds${stringify(params)}`,
      "GET",
    ) as Promise<Discord.guild.Guild[]>;
  }

  async leaveGuild(guildId: Discord.Snowflake): Promise<void> {
    await this.request(`users/@me/guilds/${guildId}`, "DELETE");
  }

  async getUserDMs(): Promise<Discord.channel.Channel[]> {
    return this.request(
      "users/@me/channels",
      "GET",
    ) as Promise<Discord.channel.Channel[]>;
  }

  async createDM(
    data: Discord.channel.CreateDM,
  ): Promise<Discord.channel.Channel> {
    return this.request(
      "users/@me/channels",
      "POST",
      data,
    ) as Promise<Discord.channel.Channel>;
  }

  async createGroupDM(
    data: Discord.channel.CreateGroupDM,
  ): Promise<Discord.channel.Channel> {
    return this.request(
      "users/@me/channels",
      "POST",
      data,
    ) as Promise<Discord.channel.Channel>;
  }

  async getUserConnections(): Promise<Discord.user.Connection[]> {
    return this.request(
      "users/@me/connections",
      "GET",
    ) as Promise<Discord.user.Connection[]>;
  }

  //endregion

  //region Voice
  async listVoiceRegions(): Promise<Discord.voice.Region[]> {
    return this.request("voice/regions", "GET") as Promise<
      Discord.voice.Region[]
    >;
  }

  //endregion

  //region Webhook
  async createWebhook(
    channelId: Discord.Snowflake,
    data: Discord.webhook.Create,
  ): Promise<Discord.webhook.Webhook> {
    return this.request(
      `channels/${channelId}/webhooks`,
      "POST",
      data,
    ) as Promise<Discord.webhook.Webhook>;
  }

  async getChannelWebhooks(
    channelId: Discord.Snowflake,
  ): Promise<Discord.webhook.Webhook[]> {
    return this.request(
      `channels/${channelId}/webhooks`,
      "GET",
    ) as Promise<Discord.webhook.Webhook[]>;
  }

  async getGuildWebhooks(
    guildId: Discord.Snowflake,
  ): Promise<Discord.webhook.Webhook[]> {
    return this.request(
      `guilds/${guildId}/webhooks`,
      "GET",
    ) as Promise<Discord.webhook.Webhook[]>;
  }

  async getWebhook(
    webhookId: Discord.Snowflake,
  ): Promise<Discord.webhook.Webhook> {
    return this.request(
      `webhooks/${webhookId}`,
      "GET",
    ) as Promise<Discord.webhook.Webhook>;
  }

  async getWebhookWithToken(
    webhookId: Discord.Snowflake,
    webhookToken: string,
  ): Promise<Discord.webhook.Webhook> {
    return this.request(
      `webhooks/${webhookId}/${webhookToken}`,
      "GET",
    ) as Promise<Discord.webhook.Webhook>;
  }

  async modifyWebhook(
    webhookId: Discord.Snowflake,
    data: Discord.webhook.Modify,
  ): Promise<Discord.webhook.Webhook> {
    return this.request(
      `webhooks/${webhookId}`,
      "PATCH",
      data,
    ) as Promise<Discord.webhook.Webhook>;
  }

  async modifyWebhookWithToken(
    webhookId: Discord.Snowflake,
    webhookToken: string,
    data: Discord.webhook.Modify,
  ): Promise<Discord.webhook.Webhook> {
    return this.request(
      `webhooks/${webhookId}/${webhookToken}`,
      "PATCH",
      data,
    ) as Promise<Discord.webhook.Webhook>;
  }

  async deleteWebhook(webhookId: Discord.Snowflake): Promise<void> {
    await this.request(`webhooks/${webhookId}`, "DELETE");
  }

  async deleteWebhookWithToken(
    webhookId: Discord.Snowflake,
    webhookToken: string,
  ): Promise<void> {
    await this.request(`webhooks/${webhookId}/${webhookToken}`, "DELETE");
  }

  async executeWebhook(
    webhookId: Discord.Snowflake,
    webhookToken: string,
    data: Discord.webhook.ExecuteBody,
    params: Discord.webhook.ExecuteParams,
  ): Promise<void> {
    await this.request(
      `webhooks/${webhookId}/${webhookToken}${stringify(params)}`,
      "POST",
      data,
    );
  }

  async executeSlackCompatibleWebhook(
    webhookId: Discord.Snowflake,
    webhookToken: string,
    data: any,
    params: Discord.webhook.ExecuteParams,
  ): Promise<void> {
    await this.request(
      `webhooks/${webhookId}/${webhookToken}/slack${stringify(params)}`,
      "POST",
      data,
    );
  }

  async executeGitHubCompatibleWebhook(
    webhookId: Discord.Snowflake,
    webhookToken: string,
    data: any,
    params: Discord.webhook.ExecuteParams,
  ): Promise<void> {
    await this.request(
      `webhooks/${webhookId}/${webhookToken}/github${stringify(params)}`,
      "POST",
      data,
    );
  }

  //endregion

  //region Gateway
  async getGateway(): Promise<Discord.gateway.Gateway> {
    return this.request("gateway", "GET") as Promise<Discord.gateway.Gateway>;
  }

  async getGatewayBot(): Promise<Discord.gateway.GatewayBot> {
    return this.request(
      "gateway/bot",
      "GET",
    ) as Promise<Discord.gateway.GatewayBot>;
  }

  //endregion
}
