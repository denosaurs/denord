import {stringifyQueryParams as stringify} from "../utils/mod.ts";
import {DiscordJSONError, HTTPError} from "./Error.ts";

import {
	auditLog,
	channel,
	emoji,
	generics,
	guild,
	guildMember,
	integration,
	invite,
	message,
	role,
	user,
	voice,
	webhook
} from "../structures/mod.ts";


type Snowflake = generics.Snowflake;


/**
 * a client to make HTTP requests to Discord
 * NOTE: there are no explanations what each of the methods do as they are identical to Discord's endpoints
 * */
export class RestClient {
	token: string;
	
	
	constructor(token?: string) {
		this.token = token ?? "";
	}
	
	
	private async request(endpoint: string, method: ("GET" | "POST" | "PUT" | "PATCH" | "DELETE"), data?: any): Promise<unknown> {
		const headers = new Headers({
			"User-Agent": "DiscordBot (https://github.com/DenordTS/denord, master)"
		});
		
		if (this.token) {
			headers.append("Authorization", "Bot " + this.token);
		}
		
		let body;
		
		if (data !== undefined) {
			if (data.file) {
				let {file, ...otherData} = data;
				
				data = new FormData();
				data.append("file", file, file.name);
				data.append("payload_json", otherData);
			}
			
			if (data instanceof FormData) {
				body = data;
			} else {
				headers.set("Content-Type", "application/json");
				body = JSON.stringify(data);
			}
		}
		
		
		const res = await fetch("https://discordapp.com/api/v6/" + endpoint, {
			method,
			headers,
			body
		});
		
		
		switch (res.status) {
			case 200:
			case 201:
				return await res.json();
			
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
	async getGuildAuditLog(guildId: Snowflake) {
		return await this.request(`guilds/${guildId}/audit-logs`, "GET") as auditLog.AuditLog;
	}
	
	//endregion
	
	//region Channel
	async getChannel(channelId: Snowflake) {
		return await this.request(`channels/${channelId}`, "GET") as channel.Channel;
	}
	
	async modifyChannel(channelId: Snowflake, data: channel.Modify) {
		return await this.request(`channels/${channelId}`, "PATCH", data) as channel.Channel;
	}
	
	async deleteChannel(channelId: Snowflake) {
		return await this.request(`channels/${channelId}`, "DELETE") as channel.Channel;
	}
	
	async getChannelMessages(channelId: Snowflake, params: channel.GetMessages) {
		return await this.request(`channels/${channelId}/messages${stringify(params)}`, "GET") as message.Message[];
	}
	
	async getChannelMessage(channelId: Snowflake, messageId: Snowflake) {
		return await this.request(`channels/${channelId}/messages/${messageId}`, "GET") as message.Message;
	}
	
	async createMessage(channelId: Snowflake, data: message.Create) {
		return await this.request(`channels/${channelId}/messages`, "POST", data) as message.Message;
	}
	
	//TODO: correct type for emoji?
	async createReaction(channelId: Snowflake, messageId: Snowflake, emoji: string) {
		await this.request(`channels/${channelId}/messages/${messageId}/reactions/${emoji}/@me`, "PUT");
	}
	
	async deleteOwnReaction(channelId: Snowflake, messageId: Snowflake, emoji: string) {
		await this.request(`channels/${channelId}/messages/${messageId}/reactions/${emoji}/@me`, "DELETE");
	}
	
	async deleteUserReaction(channelId: Snowflake, messageId: Snowflake, emoji: string, userId: Snowflake) {
		await this.request(`channels/${channelId}/messages/${messageId}/${emoji}/reactions/${userId}`, "DELETE");
	}
	
	async getReactions(channelId: Snowflake, messageId: Snowflake, emoji: string, params: channel.GetReactions) {
		return await this.request(`channels/${channelId}/messages/${messageId}/reactions/${emoji}${stringify(params)}`, "GET") as user.User[];
	}
	
	async deleteAllReactions(channelId: Snowflake, messageId: Snowflake) {
		await this.request(`channels/${channelId}/messages/${messageId}/reactions`, "DELETE");
	}
	
	async deleteAllReactionsForEmoji(channelId: Snowflake, messageId: Snowflake, emoji: string) {
		await this.request(`channels/${channelId}/messages/${messageId}/reactions/${emoji}`, "DELETE");
	}
	
	async editMessage(channelId: Snowflake, messageId: Snowflake, data: message.Edit) {
		return await this.request(`channels/${channelId}/messages/${messageId}`, "PATCH", data) as message.Message;
	}
	
	async deleteMessage(channelId: Snowflake, messageId: Snowflake) {
		await this.request(`channels/${channelId}/messages/${messageId}`, "DELETE");
	}
	
	async bulkDeleteMessages(channelId: Snowflake, data: channel.BulkDelete) {
		await this.request(`channels/${channelId}/messages/bulk-delete`, "POST", data);
	}
	
	async editChannelPermissions(channelId: Snowflake, overwriteId: Snowflake, data: Omit<channel.Overwrite, "id">) {
		await this.request(`channels/${channelId}/permissions/${overwriteId}`, "PUT", data);
	}
	
	async getChannelInvites(channelId: Snowflake) {
		return await this.request(`channels/${channelId}/invites`, "GET") as invite.Invite[];
	}
	
	async createChannelInvite(channelId: Snowflake, data: invite.Create) {
		return await this.request(`channels/${channelId}/invites`, "POST", data) as invite.Invite;
	}
	
	async deleteChannelPermission(channelId: Snowflake, overwriteId: Snowflake) {
		await this.request(`channels/${channelId}/permissions/${overwriteId}`, "DELETE");
	}
	
	async triggerTypingIndicator(channelId: Snowflake) {
		await this.request(`channels/${channelId}/typing`, "POST");
	}
	
	async getPinnedMessages(channelId: Snowflake) {
		return await this.request(`channels/${channelId}/pins`, "GET") as message.Message[];
	}
	
	async addPinnedChannelMessage(channelId: Snowflake, messageId: Snowflake) {
		await this.request(`channels/${channelId}/pins/${messageId}`, "PUT");
	}
	
	async deletePinnedChannelMessage(channelId: Snowflake, messageId: Snowflake) {
		await this.request(`channels/${channelId}/pins/${messageId}`, "DELETE");
	}
	
	async groupDMAddRecipient(channelId: Snowflake, userId: Snowflake, data: channel.GroupDMAddRecipient) {
		await this.request(`channels/${channelId}/recipients/${userId}`, "PUT", data);
	}
	
	async groupDMRemoveRecipient(channelId: Snowflake, userId: Snowflake) {
		await this.request(`channels/${channelId}/recipients/${userId}`, "DELETE");
	}
	
	//endregion
	
	//region Emoji
	async listGuildEmojis(guildId: Snowflake) {
		return await this.request(`guilds/${guildId}/emojis`, "GET") as emoji.Emoji[];
	}
	
	async getGuildEmoji(guildId: Snowflake, emojiId: Snowflake) {
		return await this.request(`guilds/${guildId}/emojis/${emojiId}`, "GET") as emoji.Emoji;
	}
	
	async createGuildEmoji(guildId: Snowflake, data: emoji.Create) {
		return await this.request(`guilds/${guildId}/emojis`, "POST", data) as emoji.Emoji;
	}
	
	async modifyGuildEmoji(guildId: Snowflake, emojiId: Snowflake, data: emoji.Modify) {
		return await this.request(`guilds/${guildId}/emojis/${emojiId}`, "PATCH", data) as emoji.Emoji;
	}
	
	async deleteGuildEmoji(guildId: Snowflake, emojiId: Snowflake) {
		await this.request(`guilds/${guildId}/emojis/${emojiId}`, "DELETE");
	}
	
	//endregion
	
	//region Guild
	async createGuild(data: guild.Create) {
		return await this.request("guilds", "POST", data) as guild.Guild;
	}
	
	async getGuild(guildId: Snowflake) {
		return await this.request(`guilds/${guildId}`, "GET") as guild.Guild;
	}
	
	async modifyGuild(guildId: Snowflake, data: guild.Modify) {
		return await this.request(`guilds/${guildId}`, "PATCH", data) as guild.Guild;
	}
	
	async deleteGuild(guildId: Snowflake) {
		await this.request(`guilds/${guildId}`, "DELETE");
	}
	
	async getGuildChannels(guildId: Snowflake) {
		return await this.request(`guilds/${guildId}/channels`, "GET") as channel.Channel[];
	}
	
	async createGuildChannel(guildId: Snowflake, data: channel.CreateGuildChannel) {
		return await this.request(`guilds/${guildId}/channels`, "POST", data) as channel.Channel;
	}
	
	async modifyGuildChannelPositions(guildId: Snowflake, data: channel.GuildPosition) {
		return await this.request(`guilds/${guildId}/channels`, "PATCH", data) as channel.Channel[];
	}
	
	async getGuildMember(guildId: Snowflake, userId: Snowflake) {
		return await this.request(`guilds/${guildId}/members/${userId}`, "GET") as guildMember.GuildMember;
	}
	
	async listGuildMembers(guildId: Snowflake, params: guildMember.List) {
		return await this.request(`guilds/${guildId}/members${stringify(params)}`, "GET") as guildMember.GuildMember[];
	}
	
	async addGuildMember(guildId: Snowflake, userId: Snowflake, body: guildMember.Add) {
		return await this.request(`guilds/${guildId}/members/${userId}`, "PUT", body) as guildMember.GuildMember;
	}
	
	async modifyGuildMember(guildId: Snowflake, userId: Snowflake, body: guildMember.Modify) {
		return await this.request(`guilds/${guildId}/members/${userId}`, "PATCH", body) as guildMember.GuildMember;
	}
	
	async modifyCurrentUserNick(guildId: Snowflake, userId: Snowflake, body: guildMember.ModifyCurrentNick) {
		return await this.request(`guilds/${guildId}/members/@me/nick`, "PATCH", body) as guildMember.GuildMember;
	}
	
	async addGuildMemberRole(guildId: Snowflake, userId: Snowflake, roleId: Snowflake) {
		await this.request(`guilds/${guildId}/members/${userId}/roles/${roleId}`, "PUT");
	}
	
	async removeGuildMemberRole(guildId: Snowflake, userId: Snowflake, roleId: Snowflake) {
		await this.request(`guilds/${guildId}/members/${userId}/roles/${roleId}`, "DELETE");
	}
	
	async removeGuildMember(guildId: Snowflake, userId: Snowflake) {
		await this.request(`guilds/${guildId}/members/${userId}`, "DELETE");
	}
	
	async getGuildBans(guildId: Snowflake) {
		return await this.request(`guilds/${guildId}/bans`, "GET") as guild.Ban[];
	}
	
	async getGuildBan(guildId: Snowflake, userId: Snowflake) {
		return await this.request(`guilds/${guildId}/bans/${userId}`, "GET") as guild.Ban;
	}
	
	async createGuildBan(guildId: Snowflake, userId: Snowflake, params: guild.CreateBan) {
		await this.request(`guilds/${guildId}/bans/${userId}${stringify(params)}`, "PUT");
	}
	
	async removeGuildBan(guildId: Snowflake, userId: Snowflake) {
		await this.request(`guilds/${guildId}/bans/${userId}`, "DELETE");
	}
	
	async getGuildRoles(guildId: Snowflake) {
		return await this.request(`guilds/${guildId}/roles`, "GET") as role.Role[];
	}
	
	async createGuildRole(guildId: Snowflake, data: role.Create) {
		return await this.request(`guilds/${guildId}/roles`, "POST", data) as role.Role;
	}
	
	async modifyGuildRolePositions(guildId: Snowflake, data: role.ModifyPosition) {
		return await this.request(`guilds/${guildId}/roles`, "PATCH", data) as role.Role[];
	}
	
	async modifyGuildRole(guildId: Snowflake, data: role.Modify) {
		return await this.request(`guilds/${guildId}/roles`, "PATCH", data) as role.Role;
	}
	
	async deleteGuildRole(guildId: Snowflake, roleId: Snowflake) {
		await this.request(`guilds/${guildId}/roles/${roleId}`, "DELETE");
	}
	
	async getGuildPruneCount(guildId: Snowflake, params: guild.PruneCount) {
		await this.request(`guilds/${guildId}/prune${stringify(params)}`, "GET");
	}
	
	async beginGuildPrune(guildId: Snowflake, params: guild.BeginPrune) {
		return await this.request(`guilds/${guildId}/prune${stringify(params)}`, "POST") as { pruned: number | null };
	}
	
	async getGuildVoiceRegions(guildId: Snowflake) {
		return await this.request(`guilds/${guildId}/regions`, "GET") as voice.Region[];
	}
	
	async getGuildInvites(guildId: Snowflake) {
		return await this.request(`guilds/${guildId}/invites`, "GET") as invite.MetadataInvite;
	}
	
	async getGuildIntegrations(guildId: Snowflake) {
		return await this.request(`guilds/${guildId}/integrations`, "GET") as integration.Integration[];
	}
	
	async createGuildIntegration(guildId: Snowflake, data: integration.Create) {
		await this.request(`guilds/${guildId}/integrations`, "POST", data);
	}
	
	async modifyGuildIntegration(guildId: Snowflake, integrationId: Snowflake, data: integration.Modify) {
		await this.request(`guilds/${guildId}/integrations/${integrationId}`, "PATCH", data);
	}
	
	async deleteGuildIntegration(guildId: Snowflake, integrationId: Snowflake) {
		await this.request(`guilds/${guildId}/integrations/${integrationId}`, "DELETE");
	}
	
	async syncGuildIntegration(guildId: Snowflake, integrationId: Snowflake) {
		await this.request(`guilds/${guildId}/integrations/${integrationId}/sync`, "POST");
	}
	
	async getGuildEmbed(guildId: Snowflake) {
		return await this.request(`guilds/${guildId}/embed`, "GET") as guild.Embed;
	}
	
	async modifyGuildEmbed(guildId: Snowflake, data: guild.EmbedModify) {
		return await this.request(`guilds/${guildId}/embed`, "PATCH", data) as guild.Embed;
	}
	
	async getGuildVanityURL(guildId: Snowflake) {
		return await this.request(`guilds/${guildId}/vanity-url`, "GET") as invite.VanityURL;
	}
	
	async getGuildWidgetImage(guildId: Snowflake, params: guild.WidgetEmbedStyle) {
		return await this.request(`guilds/${guildId}/widget.png${stringify(params)}`, "GET");
	}
	
	async getGuildEmbedImage(guildId: Snowflake, params: guild.WidgetEmbedStyle) {
		return await this.request(`guilds/${guildId}/embed.png${stringify(params)}`, "GET");
	}
	
	//endregion
	
	//region Invite
	async getInvite(inviteCode: string) {
		return await this.request(`invites/${inviteCode}`, "GET") as invite.Invite;
	}
	
	async deleteInvite(inviteCode: string) {
		return await this.request(`invites/${inviteCode}`, "DELETE") as invite.Invite;
	}
	
	//endregion
	
	//region User
	async getCurrentUser() {
		return await this.request("users/@me", "GET") as user.User;
	}
	
	async getUser(userId: Snowflake) {
		return await this.request(`users/${userId}`, "GET") as user.User;
	}
	
	async modifyCurrentUser(data: user.Modify) {
		return await this.request("users/@me", "PATCH", data) as user.User;
	}
	
	async getCurrentUserGuilds(params: user.GetGuilds) {
		return await this.request(`users/@me/guilds${stringify(params)}`, "GET") as guild.Guild[];
	}
	
	async leaveGuild(guildId: Snowflake) {
		await this.request(`users/@me/guilds/${guildId}`, "DELETE");
	}
	
	async getUserDMs() {
		return await this.request("users/@me/channels", "GET") as channel.Channel[];
	}
	
	async createDM(data: channel.CreateDM) {
		return await this.request("users/@me/channels", "POST", data) as channel.Channel;
	}
	
	async createGroupDM(data: channel.CreateGroupDM) {
		return await this.request("users/@me/channels", "POST", data) as channel.Channel;
	}
	
	async getUserConnections() {
		return await this.request("users/@me/connections", "GET") as user.Connection[];
	}
	
	//endregion
	
	//region Voice
	async listVoiceRegions() {
		return await this.request("voice/regions", "GET") as voice.Region[];
	}
	
	//endregion
	
	//region Webhook
	async createWebhook(channelId: Snowflake, data: webhook.Create) {
		return await this.request(`channels/${channelId}/webhooks`, "POST", data) as webhook.Webhook;
	}
	
	async getChannelWebhooks(channelId: Snowflake) {
		return await this.request(`channels/${channelId}/webhooks`, "GET") as webhook.Webhook[];
	}
	
	async getGuildWebhooks(guildId: Snowflake) {
		return await this.request(`guilds/${guildId}/webhooks`, "GET") as webhook.Webhook[];
	}
	
	async getWebhook(webhookId: Snowflake) {
		return await this.request(`webhooks/${webhookId}`, "GET") as webhook.Webhook;
	}
	
	async getWebhookWithToken(webhookId: Snowflake, webhookToken: string) {
		return await this.request(`webhooks/${webhookId}/${webhookToken}`, "GET") as webhook.Webhook;
	}
	
	async modifyWebhook(webhookId: Snowflake, data: webhook.Modify) {
		return await this.request(`webhooks/${webhookId}`, "PATCH", data) as webhook.Webhook;
	}
	
	async modifyWebhookWithToken(webhookId: Snowflake, webhookToken: string, data: webhook.Modify) {
		return await this.request(`webhooks/${webhookId}/${webhookToken}`, "PATCH", data) as webhook.Webhook;
	}
	
	async deleteWebhook(webhookId: Snowflake) {
		await this.request(`webhooks/${webhookId}`, "DELETE");
	}
	
	async deleteWebhookWithToken(webhookId: Snowflake, webhookToken: string) {
		await this.request(`webhooks/${webhookId}/${webhookToken}`, "DELETE");
	}
	
	async executeWebhook(webhookId: Snowflake, webhookToken: string, data: webhook.ExecuteBody, params: webhook.ExecuteParams) {
		await this.request(`webhooks/${webhookId}/${webhookToken}${stringify(params)}`, "POST", data);
	}
	
	async executeSlackCompatibleWebhook(webhookId: Snowflake, webhookToken: string, data: any, params: webhook.ExecuteParams) {
		await this.request(`webhooks/${webhookId}/${webhookToken}/slack${stringify(params)}`, "POST", data);
	}
	
	async executeGitHubCompatibleWebhook(webhookId: Snowflake, webhookToken: string, data: any, params: webhook.ExecuteParams) {
		await this.request(`webhooks/${webhookId}/${webhookToken}/github${stringify(params)}`, "POST", data);
	}
	
	//endregion
	
	//region Gateway
	async getGateway() {
		return await this.request("gateway", "GET") as { url: string };
	}
	
	async getGatewayBot() {
		return await this.request("gateway/bot", "GET") as {
			url: string;
			shards: number;
			session_start_limit: {
				total: number;
				remaining: number;
				reset_after: number;
			}
		};
	}
	
	//endregion
}
