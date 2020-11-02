import type * as Discord from "../discord.ts";
import { URLs } from "../utils/utils.ts";
import { DiscordJSONError, HTTPError } from "./Error.ts";
import { RateLimit, TaskQueue } from "./TaskQueue.ts";

/**
 * A client to make HTTP requests to Discord
 * NOTE: There are no explanations what each of the methods do as they are identical to Discord's endpoints.
 * Only endpoint not included is "Get Guild Widget Image" */
export class RestClient {
  /** The token to make requests with */
  token: string;
  /** Whether the token is a bot token or not */
  bot: boolean;
  /** Ratelimit tracking buckets */
  buckets: { [key: string]: TaskQueue } = {};

  /**
   * @param token - The token to make requests with
   * @param bot - Whether the token is a bot token or not
   */
  constructor(token?: string, bot?: boolean) {
    this.token = token ?? "";
    this.bot = bot ?? true;
  }

  private async request<T extends unknown>(
    endpoint: string,
    {
      method,
      data,
      params,
      reason,
    }: {
      method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
      // deno-lint-ignore no-explicit-any
      data?: any;
      // deno-lint-ignore no-explicit-any
      params?: any;
      reason?: string;
    },
  ): Promise<T> {
    const task = async (): Promise<T> => {
      const headers = new Headers({
        "User-Agent": "DiscordBot (https://github.com/denosaurs/denord, 0.0.1)",
      });

      if (this.token) {
        headers.append("Authorization", (this.bot ? "Bot " : "") + this.token);
      }

      if (reason) {
        headers.append("X-Audit-Log-Reason", encodeURIComponent(reason));
      }

      let body;

      if (data !== undefined) {
        if (data.file) {
          const { file, payload_json } = data;

          const form = new FormData();
          form.append("file", file, file.name);
          form.append("payload_json", payload_json);
          body = form;
        } else {
          headers.set("Content-Type", "application/json");
          body = JSON.stringify(data);
        }
      }

      let stringifiedParams;

      if (params) {
        stringifiedParams = "?" + new URLSearchParams(params).toString();
      } else {
        stringifiedParams = "";
      }

      const res = await fetch(URLs.REST + endpoint + stringifiedParams, {
        method,
        headers,
        body,
      });

      const bucket = res.headers.get("x-ratelimit-bucket");
      if (bucket) {
        const ratelimit: RateLimit = {
          bucket,
          limit: parseInt(res.headers.get("x-ratelimit-limit")!),
          remaining: parseInt(res.headers.get("x-ratelimit-remaining")!),
          reset: parseFloat(res.headers.get("x-ratelimit-reset")!) * 1e3,
          resetAfter: parseFloat(res.headers.get("x-ratelimit-reset-after")!) *
            1e3,
        };
        this.buckets[endpoint].ratelimit.reset = ratelimit.reset;
        this.buckets[endpoint].ratelimit.remaining = ratelimit.remaining;
      }

      switch (res.status) {
        case 200:
        case 201:
          return res.json();

        case 204:
          return undefined as T;

        case 400:
        case 404:
          throw new DiscordJSONError(res.status, await res.json());

        case 401:
          throw new HTTPError(res.status, "You supplied an invalid token");

        case 403:
          throw new HTTPError(
            res.status,
            "You don't have permission to do this",
          );

        case 429:
          throw new HTTPError(res.status, "You are getting rate-limited");

        case 502:
          throw new HTTPError(
            res.status,
            "Gateway unavailable. Wait and retry",
          );

        case 500:
        case 503:
        case 504:
        case 507:
        case 508:
          throw new HTTPError(res.status, "Discord internal error");

        default:
          throw new HTTPError(res.status, "Unexpected response");
      }
    };
    this.buckets[endpoint] ||= new TaskQueue({
      resetAfter: 500,
      limit: 1,
      remaining: 1,
    });
    return this.buckets[endpoint].push(task) as T;
  }

  //region Audit Log
  async getGuildAuditLog(
    guildId: Discord.Snowflake,
    params: Discord.auditLog.Params,
  ): Promise<Discord.auditLog.AuditLog> {
    return this.request(`guilds/${guildId}/audit-logs`, {
      method: "GET",
      params,
    });
  }

  //endregion

  //region Channel
  async getChannel(
    channelId: Discord.Snowflake,
  ): Promise<Discord.channel.Channel> {
    return this.request(`channels/${channelId}`, {
      method: "GET",
    });
  }

  async modifyChannel(
    channelId: Discord.Snowflake,
    data: Discord.channel.Modify,
    reason?: string,
  ): Promise<Discord.channel.GuildChannels> {
    return this.request(`channels/${channelId}`, {
      method: "PATCH",
      data,
      reason,
    });
  }

  async deleteChannel(
    channelId: Discord.Snowflake,
    reason?: string,
  ): Promise<Discord.channel.Channel> {
    return this.request(`channels/${channelId}`, {
      method: "DELETE",
      reason,
    });
  }

  async getChannelMessages(
    channelId: Discord.Snowflake,
    params: Discord.channel.GetMessages,
  ): Promise<Discord.message.Message[]> {
    return this.request(`channels/${channelId}/messages`, {
      method: "GET",
      params,
    });
  }

  async getChannelMessage(
    channelId: Discord.Snowflake,
    messageId: Discord.Snowflake,
  ): Promise<Discord.message.Message> {
    return this.request(`channels/${channelId}/messages/${messageId}`, {
      method: "GET",
    });
  }

  async createMessage(
    channelId: Discord.Snowflake,
    data: Discord.message.Create,
  ): Promise<Discord.message.Message> {
    return this.request(`channels/${channelId}/messages`, {
      method: "POST",
      data,
    });
  }

  async crosspostMessage(
    channelId: Discord.Snowflake,
    messageId: Discord.Snowflake,
  ): Promise<Discord.message.Message> {
    return this.request(
      `channels/${channelId}/messages/${messageId}/crosspost`,
      {
        method: "POST",
      },
    );
  }

  async createReaction(
    channelId: Discord.Snowflake,
    messageId: Discord.Snowflake,
    emoji: string,
  ): Promise<void> {
    await this.request(
      `channels/${channelId}/messages/${messageId}/reactions/${
        encodeURIComponent(emoji)
      }/@me`,
      {
        method: "PUT",
      },
    );
  }

  async deleteOwnReaction(
    channelId: Discord.Snowflake,
    messageId: Discord.Snowflake,
    emoji: string,
  ): Promise<void> {
    await this.request(
      `channels/${channelId}/messages/${messageId}/reactions/${
        encodeURIComponent(emoji)
      }/@me`,
      {
        method: "DELETE",
      },
    );
  }

  async deleteUserReaction(
    channelId: Discord.Snowflake,
    messageId: Discord.Snowflake,
    emoji: string,
    userId: Discord.Snowflake,
  ): Promise<void> {
    await this.request(
      `channels/${channelId}/messages/${messageId}/${
        encodeURIComponent(emoji)
      }/reactions/${userId}`,
      {
        method: "DELETE",
      },
    );
  }

  async getReactions(
    channelId: Discord.Snowflake,
    messageId: Discord.Snowflake,
    emoji: string,
    params: Discord.channel.GetReactions,
  ): Promise<Discord.user.PublicUser[]> {
    return this.request(
      `channels/${channelId}/messages/${messageId}/reactions/${
        encodeURIComponent(emoji)
      }`,
      {
        method: "GET",
        params,
      },
    );
  }

  async deleteAllReactions(
    channelId: Discord.Snowflake,
    messageId: Discord.Snowflake,
  ): Promise<void> {
    await this.request(
      `channels/${channelId}/messages/${messageId}/reactions`,
      {
        method: "DELETE",
      },
    );
  }

  async deleteAllReactionsForEmoji(
    channelId: Discord.Snowflake,
    messageId: Discord.Snowflake,
    emoji: string,
  ): Promise<void> {
    await this.request(
      `channels/${channelId}/messages/${messageId}/reactions/${
        encodeURIComponent(emoji)
      }`,
      {
        method: "DELETE",
      },
    );
  }

  async editMessage(
    channelId: Discord.Snowflake,
    messageId: Discord.Snowflake,
    data: Discord.message.Edit,
  ): Promise<Discord.message.Message> {
    return this.request(`channels/${channelId}/messages/${messageId}`, {
      method: "PATCH",
      data,
    });
  }

  async deleteMessage(
    channelId: Discord.Snowflake,
    messageId: Discord.Snowflake,
    reason?: string,
  ): Promise<void> {
    await this.request(`channels/${channelId}/messages/${messageId}`, {
      method: "DELETE",
      reason,
    });
  }

  async bulkDeleteMessages(
    channelId: Discord.Snowflake,
    data: Discord.channel.BulkDelete,
    reason?: string,
  ): Promise<void> {
    await this.request(`channels/${channelId}/messages/bulk-delete`, {
      method: "POST",
      data,
      reason,
    });
  }

  async editChannelPermissions(
    channelId: Discord.Snowflake,
    overwriteId: Discord.Snowflake,
    data: Omit<Discord.channel.Overwrite, "id">,
    reason?: string,
  ): Promise<void> {
    await this.request(`channels/${channelId}/permissions/${overwriteId}`, {
      method: "PUT",
      data,
      reason,
    });
  }

  async getChannelInvites(
    channelId: Discord.Snowflake,
  ): Promise<Discord.invite.Invite[]> {
    return this.request(`channels/${channelId}/invites`, {
      method: "GET",
    });
  }

  async createChannelInvite(
    channelId: Discord.Snowflake,
    data: Discord.invite.Create,
    reason?: string,
  ): Promise<Discord.invite.Invite> {
    return this.request(`channels/${channelId}/invites`, {
      method: "POST",
      data,
      reason,
    });
  }

  async deleteChannelPermission(
    channelId: Discord.Snowflake,
    overwriteId: Discord.Snowflake,
    reason?: string,
  ): Promise<void> {
    await this.request(`channels/${channelId}/permissions/${overwriteId}`, {
      method: "DELETE",
      reason,
    });
  }

  async followNewsChannel(
    channelId: Discord.Snowflake,
    data: Discord.channel.FollowNewsChannel,
  ): Promise<Discord.channel.FollowedChannel> {
    return this.request(`channels/${channelId}/followers`, {
      method: "POST",
      data,
    });
  }

  async triggerTypingIndicator(channelId: Discord.Snowflake): Promise<void> {
    await this.request(`channels/${channelId}/typing`, {
      method: "POST",
    });
  }

  async getPinnedMessages(
    channelId: Discord.Snowflake,
  ): Promise<Discord.message.Message[]> {
    return this.request(`channels/${channelId}/pins`, {
      method: "GET",
    });
  }

  async addPinnedChannelMessage(
    channelId: Discord.Snowflake,
    messageId: Discord.Snowflake,
  ): Promise<void> {
    await this.request(`channels/${channelId}/pins/${messageId}`, {
      method: "PUT",
    });
  }

  async deletePinnedChannelMessage(
    channelId: Discord.Snowflake,
    messageId: Discord.Snowflake,
  ): Promise<void> {
    await this.request(`channels/${channelId}/pins/${messageId}`, {
      method: "DELETE",
    });
  }

  async groupDMAddRecipient(
    channelId: Discord.Snowflake,
    userId: Discord.Snowflake,
    data: Discord.channel.GroupDMAddRecipient,
  ): Promise<void> {
    await this.request(`channels/${channelId}/recipients/${userId}`, {
      method: "PUT",
      data,
    });
  }

  async groupDMRemoveRecipient(
    channelId: Discord.Snowflake,
    userId: Discord.Snowflake,
  ): Promise<void> {
    await this.request(`channels/${channelId}/recipients/${userId}`, {
      method: "DELETE",
    });
  }

  //endregion

  //region Emoji
  async listGuildEmojis(
    guildId: Discord.Snowflake,
  ): Promise<Discord.emoji.Emoji[]> {
    return this.request(`guilds/${guildId}/emojis`, {
      method: "GET",
    });
  }

  async getGuildEmoji(
    guildId: Discord.Snowflake,
    emojiId: Discord.Snowflake,
  ): Promise<Discord.emoji.Emoji> {
    return this.request(`guilds/${guildId}/emojis/${emojiId}`, {
      method: "GET",
    });
  }

  async createGuildEmoji(
    guildId: Discord.Snowflake,
    data: Discord.emoji.Create,
    reason?: string,
  ): Promise<Discord.emoji.GuildEmoji> {
    return this.request(`guilds/${guildId}/emojis`, {
      method: "POST",
      data,
      reason,
    });
  }

  async modifyGuildEmoji(
    guildId: Discord.Snowflake,
    emojiId: Discord.Snowflake,
    data: Discord.emoji.Modify,
    reason?: string,
  ): Promise<Discord.emoji.GuildEmoji> {
    return this.request(`guilds/${guildId}/emojis/${emojiId}`, {
      method: "PATCH",
      data,
      reason,
    });
  }

  async deleteGuildEmoji(
    guildId: Discord.Snowflake,
    emojiId: Discord.Snowflake,
    reason?: string,
  ): Promise<void> {
    await this.request(`guilds/${guildId}/emojis/${emojiId}`, {
      method: "DELETE",
      reason,
    });
  }

  //endregion

  //region Guild
  async createGuild(
    data: Discord.guild.Create,
  ): Promise<Discord.guild.RESTGuild> {
    return this.request("guilds", {
      method: "POST",
      data,
    });
  }

  async getGuild(
    guildId: Discord.Snowflake,
    params: Discord.guild.Params,
  ): Promise<Discord.guild.RESTGuild> {
    return this.request(`guilds/${guildId}`, {
      method: "GET",
      params,
    });
  }

  async getGuildPreview(
    guildId: Discord.Snowflake,
  ): Promise<Discord.guild.Preview> {
    return this.request(`guilds/${guildId}/preview`, {
      method: "GET",
    });
  }

  async modifyGuild(
    guildId: Discord.Snowflake,
    data: Discord.guild.Modify,
    reason?: string,
  ): Promise<Discord.guild.RESTGuild> {
    return this.request(`guilds/${guildId}`, {
      method: "PATCH",
      data,
      reason,
    });
  }

  async deleteGuild(guildId: Discord.Snowflake): Promise<void> {
    await this.request(`guilds/${guildId}`, {
      method: "DELETE",
    });
  }

  async getGuildChannels(
    guildId: Discord.Snowflake,
  ): Promise<Discord.channel.GuildChannels[]> {
    return this.request(`guilds/${guildId}/channels`, {
      method: "GET",
    });
  }

  async createGuildChannel(
    guildId: Discord.Snowflake,
    data: Discord.channel.CreateGuildChannel,
    reason?: string,
  ): Promise<Discord.channel.GuildChannels> {
    return this.request(`guilds/${guildId}/channels`, {
      method: "POST",
      data,
      reason,
    });
  }

  async modifyGuildChannelPositions(
    guildId: Discord.Snowflake,
    data: Discord.channel.GuildPosition[],
  ): Promise<void> {
    await this.request(`guilds/${guildId}/channels`, {
      method: "PATCH",
      data,
    });
  }

  async getGuildMember(
    guildId: Discord.Snowflake,
    userId: Discord.Snowflake,
  ): Promise<Discord.guildMember.GuildMember> {
    return this.request(`guilds/${guildId}/members/${userId}`, {
      method: "GET",
    });
  }

  async listGuildMembers(
    guildId: Discord.Snowflake,
    params: Discord.guildMember.List,
  ): Promise<Discord.guildMember.GuildMember[]> {
    return this.request(`guilds/${guildId}/members`, {
      method: "GET",
      params,
    });
  }

  async addGuildMember(
    guildId: Discord.Snowflake,
    userId: Discord.Snowflake,
    data: Discord.guildMember.Add,
  ): Promise<Discord.guildMember.GuildMember | undefined> {
    return this.request(`guilds/${guildId}/members/${userId}`, {
      method: "PUT",
      data,
    });
  }

  async modifyGuildMember(
    guildId: Discord.Snowflake,
    userId: Discord.Snowflake,
    data: Discord.guildMember.Modify,
    reason?: string,
  ): Promise<Discord.guildMember.GuildMember> {
    return this.request(`guilds/${guildId}/members/${userId}`, {
      method: "PATCH",
      data,
      reason,
    });
  }

  async modifyCurrentUserNick(
    guildId: Discord.Snowflake,
    data: Discord.guildMember.ModifyCurrentNick,
  ): Promise<Discord.guildMember.ModifyCurrentNickResponse> {
    return this.request(`guilds/${guildId}/members/@me/nick`, {
      method: "PATCH",
      data,
    });
  }

  async addGuildMemberRole(
    guildId: Discord.Snowflake,
    userId: Discord.Snowflake,
    roleId: Discord.Snowflake,
    reason?: string,
  ): Promise<void> {
    await this.request(`guilds/${guildId}/members/${userId}/roles/${roleId}`, {
      method: "PUT",
      reason,
    });
  }

  async removeGuildMemberRole(
    guildId: Discord.Snowflake,
    userId: Discord.Snowflake,
    roleId: Discord.Snowflake,
    reason?: string,
  ): Promise<void> {
    await this.request(`guilds/${guildId}/members/${userId}/roles/${roleId}`, {
      method: "DELETE",
      reason,
    });
  }

  async removeGuildMember(
    guildId: Discord.Snowflake,
    userId: Discord.Snowflake,
    reason?: string,
  ): Promise<void> {
    await this.request(`guilds/${guildId}/members/${userId}`, {
      method: "DELETE",
      reason,
    });
  }

  async getGuildBans(guildId: Discord.Snowflake): Promise<Discord.guild.Ban[]> {
    return this.request(`guilds/${guildId}/bans`, {
      method: "GET",
    });
  }

  async getGuildBan(
    guildId: Discord.Snowflake,
    userId: Discord.Snowflake,
  ): Promise<Discord.guild.Ban> {
    return this.request(`guilds/${guildId}/bans/${userId}`, {
      method: "GET",
    });
  }

  async createGuildBan(
    guildId: Discord.Snowflake,
    userId: Discord.Snowflake,
    data: Discord.guild.CreateBan,
  ): Promise<void> {
    await this.request(`guilds/${guildId}/bans/${userId}`, {
      method: "PUT",
      data,
    });
  }

  async removeGuildBan(
    guildId: Discord.Snowflake,
    userId: Discord.Snowflake,
    reason?: string,
  ): Promise<void> {
    await this.request(`guilds/${guildId}/bans/${userId}`, {
      method: "DELETE",
      reason,
    });
  }

  async getGuildRoles(
    guildId: Discord.Snowflake,
  ): Promise<Discord.role.Role[]> {
    return this.request(`guilds/${guildId}/roles`, {
      method: "GET",
    });
  }

  async createGuildRole(
    guildId: Discord.Snowflake,
    data: Discord.role.Create,
    reason?: string,
  ): Promise<Discord.role.Role> {
    return this.request(`guilds/${guildId}/roles`, {
      method: "POST",
      data,
      reason,
    });
  }

  async modifyGuildRolePositions(
    guildId: Discord.Snowflake,
    data: Discord.role.ModifyPosition[],
  ): Promise<Discord.role.Role[]> {
    return this.request(`guilds/${guildId}/roles`, {
      method: "PATCH",
      data,
    });
  }

  async modifyGuildRole(
    guildId: Discord.Snowflake,
    roleId: Discord.Snowflake,
    data: Discord.role.Modify,
    reason?: string,
  ): Promise<Discord.role.Role> {
    return this.request(`guilds/${guildId}/roles/${roleId}`, {
      method: "PATCH",
      data,
      reason,
    });
  }

  async deleteGuildRole(
    guildId: Discord.Snowflake,
    roleId: Discord.Snowflake,
    reason?: string,
  ): Promise<void> {
    await this.request(`guilds/${guildId}/roles/${roleId}`, {
      method: "DELETE",
      reason,
    });
  }

  async getGuildPruneCount(
    guildId: Discord.Snowflake,
    params: Discord.guild.PruneCount,
  ): Promise<Discord.guild.DryPruneData> {
    return this.request(`guilds/${guildId}/prune`, {
      method: "GET",
      params,
    });
  }

  async beginGuildPrune(
    guildId: Discord.Snowflake,
    data: Discord.guild.BeginPrune,
    reason?: string,
  ): Promise<Discord.guild.PruneData> {
    return this.request(`guilds/${guildId}/prune`, {
      method: "POST",
      data,
      reason,
    });
  }

  async getGuildVoiceRegions(
    guildId: Discord.Snowflake,
  ): Promise<Discord.voice.Region[]> {
    return this.request(`guilds/${guildId}/regions`, {
      method: "GET",
    });
  }

  async getGuildInvites(
    guildId: Discord.Snowflake,
  ): Promise<Discord.invite.MetadataInvite[]> {
    return this.request(`guilds/${guildId}/invites`, {
      method: "GET",
    });
  }

  async getGuildIntegrations(
    guildId: Discord.Snowflake,
  ): Promise<Discord.integration.Integration[]> {
    return this.request(`guilds/${guildId}/integrations`, {
      method: "GET",
    });
  }

  async createGuildIntegration(
    guildId: Discord.Snowflake,
    data: Discord.integration.Create,
  ): Promise<void> {
    await this.request(`guilds/${guildId}/integrations`, {
      method: "POST",
      data,
    });
  }

  async modifyGuildIntegration(
    guildId: Discord.Snowflake,
    integrationId: Discord.Snowflake,
    data: Discord.integration.Modify,
  ): Promise<void> {
    await this.request(`guilds/${guildId}/integrations/${integrationId}`, {
      method: "PATCH",
      data,
    });
  }

  async deleteGuildIntegration(
    guildId: Discord.Snowflake,
    integrationId: Discord.Snowflake,
  ): Promise<void> {
    await this.request(`guilds/${guildId}/integrations/${integrationId}`, {
      method: "DELETE",
    });
  }

  async syncGuildIntegration(
    guildId: Discord.Snowflake,
    integrationId: Discord.Snowflake,
  ): Promise<void> {
    await this.request(`guilds/${guildId}/integrations/${integrationId}/sync`, {
      method: "POST",
    });
  }

  async getGuildWidgetSettings(
    guildId: Discord.Snowflake,
  ): Promise<Discord.guild.WidgetSettings> {
    return this.request(`guilds/${guildId}/widget`, {
      method: "GET",
    });
  }

  async modifyGuildWidget(
    guildId: Discord.Snowflake,
    data: Discord.guild.WidgetModify,
  ): Promise<Discord.guild.WidgetSettings> {
    return this.request(`guilds/${guildId}/widget`, {
      method: "PATCH",
      data,
    });
  }

  //TODO: Get Guild Widget

  async getGuildVanityURL(
    guildId: Discord.Snowflake,
  ): Promise<Discord.invite.VanityURL> {
    return this.request(`guilds/${guildId}/vanity-url`, {
      method: "GET",
    });
  }

  //endregion

  //region Invite
  async getInvite(inviteCode: string): Promise<Discord.invite.Invite> {
    return this.request(`invites/${inviteCode}`, {
      method: "GET",
    });
  }

  async deleteInvite(
    inviteCode: string,
    reason?: string,
  ): Promise<Discord.invite.Invite> {
    return this.request(`invites/${inviteCode}`, {
      method: "DELETE",
      reason,
    });
  }

  //endregion

  //region User
  async getCurrentUser(): Promise<Discord.user.PrivateUser> {
    return this.request("users/@me", {
      method: "GET",
    });
  }

  async getUser(userId: Discord.Snowflake): Promise<Discord.user.PublicUser> {
    return this.request(`users/${userId}`, {
      method: "GET",
    });
  }

  async modifyCurrentUser(
    data: Discord.user.Modify,
  ): Promise<Discord.user.PrivateUser> {
    return this.request("users/@me", {
      method: "PATCH",
      data,
    });
  }

  async getCurrentUserGuilds(
    params: Discord.user.GetGuilds,
  ): Promise<Discord.guild.CurrentUserGuild[]> {
    return this.request(`users/@me/guilds`, {
      method: "GET",
      params,
    });
  }

  async leaveGuild(guildId: Discord.Snowflake): Promise<void> {
    await this.request(`users/@me/guilds/${guildId}`, {
      method: "DELETE",
    });
  }

  async getUserDMs(): Promise<Discord.channel.DMChannels[]> {
    return this.request("users/@me/channels", {
      method: "GET",
    });
  }

  async createDM(
    data: Discord.channel.CreateDM,
  ): Promise<Discord.channel.DMChannel> {
    return this.request("users/@me/channels", {
      method: "POST",
      data,
    });
  }

  async createGroupDM(
    data: Discord.channel.CreateGroupDM,
  ): Promise<Discord.channel.GroupDMChannel> {
    return this.request("users/@me/channels", {
      method: "POST",
      data,
    });
  }

  async getUserConnections(): Promise<Discord.user.Connection[]> {
    return this.request("users/@me/connections", {
      method: "GET",
    });
  }

  //endregion

  //region Voice
  async listVoiceRegions(): Promise<Discord.voice.Region[]> {
    return this.request("voice/regions", {
      method: "GET",
    });
  }

  //endregion

  //region Webhook
  async createWebhook(
    channelId: Discord.Snowflake,
    data: Discord.webhook.Create,
    reason?: string,
  ): Promise<Discord.webhook.Webhook> {
    return this.request(`channels/${channelId}/webhooks`, {
      method: "POST",
      data,
      reason,
    });
  }

  async getChannelWebhooks(
    channelId: Discord.Snowflake,
  ): Promise<Discord.webhook.Webhook[]> {
    return this.request(`channels/${channelId}/webhooks`, {
      method: "GET",
    });
  }

  async getGuildWebhooks(
    guildId: Discord.Snowflake,
  ): Promise<Discord.webhook.Webhook[]> {
    return this.request(`guilds/${guildId}/webhooks`, {
      method: "GET",
    });
  }

  async getWebhook(
    webhookId: Discord.Snowflake,
  ): Promise<Discord.webhook.Webhook> {
    return this.request(`webhooks/${webhookId}`, {
      method: "GET",
    });
  }

  async getWebhookWithToken(
    webhookId: Discord.Snowflake,
    webhookToken: string,
  ): Promise<Discord.webhook.Webhook> {
    return this.request(`webhooks/${webhookId}/${webhookToken}`, {
      method: "GET",
    });
  }

  async modifyWebhook(
    webhookId: Discord.Snowflake,
    data: Discord.webhook.Modify,
    reason?: string,
  ): Promise<Discord.webhook.Webhook> {
    return this.request(`webhooks/${webhookId}`, {
      method: "PATCH",
      data,
      reason,
    });
  }

  async modifyWebhookWithToken(
    webhookId: Discord.Snowflake,
    webhookToken: string,
    data: Discord.webhook.Modify,
    reason?: string,
  ): Promise<Discord.webhook.Webhook> {
    return this.request(`webhooks/${webhookId}/${webhookToken}`, {
      method: "PATCH",
      data,
      reason,
    });
  }

  async deleteWebhook(
    webhookId: Discord.Snowflake,
    reason?: string,
  ): Promise<void> {
    await this.request(`webhooks/${webhookId}`, {
      method: "DELETE",
      reason,
    });
  }

  async deleteWebhookWithToken(
    webhookId: Discord.Snowflake,
    webhookToken: string,
    reason?: string,
  ): Promise<void> {
    await this.request(`webhooks/${webhookId}/${webhookToken}`, {
      method: "DELETE",
      reason,
    });
  }

  async executeWebhook(
    webhookId: Discord.Snowflake,
    webhookToken: string,
    data: Discord.webhook.ExecuteBody,
    params: Discord.webhook.ExecuteParams & { wait: true },
  ): Promise<Discord.message.Message>;
  async executeWebhook(
    webhookId: Discord.Snowflake,
    webhookToken: string,
    data: Discord.webhook.ExecuteBody,
    params: Discord.webhook.ExecuteParams & { wait?: false },
  ): Promise<undefined>;
  async executeWebhook(
    webhookId: Discord.Snowflake,
    webhookToken: string,
    data: Discord.webhook.ExecuteBody,
    params: Discord.webhook.ExecuteParams,
  ): Promise<void | Discord.message.Message>;
  async executeWebhook(
    webhookId: Discord.Snowflake,
    webhookToken: string,
    data: Discord.webhook.ExecuteBody,
    params: Discord.webhook.ExecuteParams,
  ): Promise<undefined | Discord.message.Message> {
    return this.request(`webhooks/${webhookId}/${webhookToken}`, {
      method: "POST",
      data,
      params,
    });
  }

  async executeSlackCompatibleWebhook(
    webhookId: Discord.Snowflake,
    webhookToken: string,
    data: unknown,
    params: Discord.webhook.ExecuteParams,
  ): Promise<void> {
    await this.request(`webhooks/${webhookId}/${webhookToken}/slack$`, {
      method: "POST",
      data,
      params,
    });
  }

  async executeGitHubCompatibleWebhook(
    webhookId: Discord.Snowflake,
    webhookToken: string,
    data: unknown,
    params: Discord.webhook.ExecuteParams,
  ): Promise<void> {
    await this.request(`webhooks/${webhookId}/${webhookToken}/github`, {
      method: "POST",
      data,
      params,
    });
  }

  //endregion

  //region Gateway
  async getGateway(): Promise<Discord.gateway.Gateway> {
    return this.request("gateway", {
      method: "GET",
    });
  }

  async getGatewayBot(): Promise<Discord.gateway.GatewayBot> {
    return this.request("gateway/bot", {
      method: "GET",
    });
  }

  //endregion
}
