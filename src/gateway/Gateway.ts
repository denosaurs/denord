// @deno-types="../discord.d.ts"

import {
	connectWebSocket,
	isWebSocketCloseEvent,
	WebSocket,
} from "https://deno.land/std@0.50.0/ws/mod.ts";
import EventEmitter from "https://deno.land/std@0.50.0/node/events.ts";


export interface ReadyEvent {
	v: number;
	user: Discord.user.User;
	private_channels: [];
	guilds: Discord.guild.UnavailableGuild[];
	session_id: string;
	shard?: [number, number];
}

export interface events {
	READY: ReadyEvent;

	CHANNEL_CREATE: Discord.channel.Channel;
	CHANNEL_UPDATE: Discord.channel.Channel;
	CHANNEL_DELETE: Discord.channel.Channel;
	CHANNEL_PINS_UPDATE: Discord.channel.PinsUpdateEvent;

	GUILD_CREATE: Discord.guild.Guild;
	GUILD_UPDATE: Discord.guild.Guild;
	GUILD_DELETE: Discord.guild.UnavailableGuild;
	GUILD_BAN_ADD: Discord.guild.BanEvent;
	GUILD_BAN_REMOVE: Discord.guild.BanEvent;
	GUILD_EMOJIS_UPDATE: Discord.guild.EmojisUpdateEvent;
	GUILD_INTEGRATIONS_UPDATE: Discord.guild.IntegrationsUpdateEvent;
	GUILD_MEMBER_ADD: Discord.guild.MemberAddEvent;
	GUILD_MEMBER_REMOVE: Discord.guild.MemberRemoveEvent;
	GUILD_MEMBER_UPDATE: Discord.guild.MemberUpdateEvent;
	GUILD_MEMBERS_CHUNK: Discord.guild.MembersChunkEvent;
	GUILD_ROLE_CREATE: Discord.role.UpdateEvent;
	GUILD_ROLE_UPDATE: Discord.role.UpdateEvent;
	GUILD_ROLE_DELETE: Discord.role.DeleteEvent;

	INVITE_CREATE: Discord.invite.CreateEvent;
	INVITE_DELETE: Discord.invite.DeleteEvent;

	MESSAGE_CREATE: Discord.message.Message;
	MESSAGE_UPDATE: Discord.message.Message;
	MESSAGE_DELETE: Discord.message.DeleteEvent;
	MESSAGE_DELETE_BULK: Discord.channel.DeleteBulkEvent;
	MESSAGE_REACTION_ADD: Discord.message.ReactionAddEvent;
	MESSAGE_REACTION_REMOVE: Discord.message.ReactionRemoveEvent;
	MESSAGE_REACTION_REMOVE_ALL: Discord.message.ReactionRemoveAllEvent;
	MESSAGE_REACTION_REMOVE_EMOJI: Discord.message.ReactionRemoveEmojiEvent;

	PRESENCE_UPDATE: Discord.guild.PresenceUpdateEvent;
	TYPING_START: Discord.channel.TypingStartEvent;
	USER_UPDATE: Discord.user.User;

	VOICE_STATE_UPDATE: Discord.voice.State;
	VOICE_SERVER_UPDATE: Discord.voice.ServerUpdateEvent;

	WEBHOOKS_UPDATE: Discord.webhook.UpdateEvent;
}

interface allEvents extends events {
	raw: {
		name: keyof events;
		data: events[keyof events];
	};
}


export interface Gateway {
	emit<T extends keyof allEvents>(eventName: T, args: allEvents[T]): boolean;

	on<T extends keyof allEvents>(eventName: T, listener: (args: allEvents[T]) => void): this;

	off<T extends keyof allEvents>(eventName: T, listener: (args: allEvents[T]) => void): this;
}

//TODO cache & sharding, and send opcode 3 & 8
export class Gateway extends EventEmitter {
	readonly token: string;
	readonly intents: number | undefined;
	socket!: WebSocket;
	heartbeat!: number;
	sessionId!: string;
	seq!: number;
	ACKed: boolean = false;
	beatInterval!: number;

	constructor(token: string, intents?: number) {
		super();

		this.token = token;
		this.intents = intents;

		this.connect();
	}


	private send(data: any) {
		this.socket.send(JSON.stringify(data));
	}

	private beat() {
		this.send({op: 1, d: this.heartbeat});
	}

	private startBeating() {
		this.beat();

		this.beatInterval = setInterval(() => {
			if (this.ACKed) {
				this.ACKed = false;
				this.beat();
			} else {
				this.socket.close(1008);
				this.reconnect();
			}
		}, this.heartbeat);
	}

	private reconnect(resume = true) {
		if (!this.socket.isClosed) {
			this.socket.close();
		}

		clearInterval(this.beatInterval);
		this.connect();
		if (this.seq && resume) {
			this.send({
				op: 6,
				d: {
					token: this.token,
					session_id: this.sessionId,
					seq: this.seq,
				},
			});
		}
	}

	private async connect() {
		this.socket = await connectWebSocket("wss://gateway.discord.gg/?v=6&encoding=json");

		let firstPayload = JSON.parse((await this.socket[Symbol.asyncIterator]().next()).value) as Discord.gateway.Payload;
		if (firstPayload.op === 10) {
			this.heartbeat = (firstPayload.d as { heartbeat_interval: number }).heartbeat_interval;
			this.send({
				op: 2,
				d: {
					token: this.token,
					intents: this.intents,
					properties: {
						"$os": Deno.build.os,
						"$browser": "denord-core",
						"$device": "denord-core",
					},
				},
			});
		} else {
			throw new Error("Expected HELLO, received " + firstPayload.op);
		}

		this.listener();
		this.startBeating();
	}

	private async listener() {
		for await (const msg of this.socket) {
			if (typeof msg === "string") {
				const payload = JSON.parse(msg) as Discord.gateway.Payload;
				switch (payload.op) {
					case 0:
						await this.event(payload);
						break;
					case 1:
						this.beat();
						break;
					case 7:
						this.reconnect();
						break;
					case 9:
						//TODO
						break;
					case 11:
						this.ACKed = true;
						break;
				}
			} else if (isWebSocketCloseEvent(msg)) {
				switch (msg.code) {
					case 4000:
						this.reconnect();
						break;
					case 4009:
						this.reconnect(false);
						break;
					case 4001:
					case 4002:
					case 4003:
					case 4004:
					case 4005:
					case 4007:
					case 4008:
					case 4012:
						throw new Error(`Please file an issue.\nOpcode: ${msg.code}`);
					case 4013:
						throw new Error("You provided invalid intents!");
					case 4014:
						throw new Error("You provided an intent that you are not allowed to use!");
					//TODO
					case 4010:
						break;
					case 4011:
						break;

					default:
						throw new Error(`Unexpected opcode ${msg.code}`);
				}
			}
		}
	}

	private async event(payload: Discord.gateway.Payload) {
		this.seq = payload.s!;

		switch (payload.t!) {
			case "READY":
				this.sessionId = (payload.d as ReadyEvent).session_id;
				this.emit("READY", payload.d as ReadyEvent);
				break;
			case "RESUMED":
				break;
			case "RECONNECT":
				this.reconnect();
				break;
			case "INVALID_SESSION":
				if (payload.d) {
					this.reconnect();
				} else {
					clearInterval(this.beatInterval);
				}
				break;

			//region Channel
			case "CHANNEL_CREATE":
				this.emit("CHANNEL_CREATE", payload.d as Discord.channel.Channel);
				break;
			case "CHANNEL_UPDATE":
				this.emit("CHANNEL_UPDATE", payload.d as Discord.channel.Channel);
				break;
			case "CHANNEL_DELETE":
				this.emit("CHANNEL_DELETE", payload.d as Discord.channel.Channel);
				break;
			case "CHANNEL_PINS_UPDATE":
				this.emit("CHANNEL_PINS_UPDATE", payload.d as Discord.channel.PinsUpdateEvent);
				break;
			//endregion

			//region Guild
			case "GUILD_CREATE":
				this.emit("GUILD_CREATE", payload.d as Discord.guild.Guild);
				break;
			case "GUILD_UPDATE":
				this.emit("GUILD_UPDATE", payload.d as Discord.guild.Guild);
				break;
			case "GUILD_DELETE":
				this.emit("GUILD_DELETE", payload.d as Discord.guild.UnavailableGuild);
				break;
			case "GUILD_BAN_ADD":
				this.emit("GUILD_BAN_ADD", payload.d as Discord.guild.BanEvent);
				break;
			case "GUILD_BAN_REMOVE":
				this.emit("GUILD_BAN_REMOVE", payload.d as Discord.guild.BanEvent);
				break;
			case "GUILD_EMOJIS_UPDATE":
				this.emit("GUILD_EMOJIS_UPDATE", payload.d as Discord.guild.EmojisUpdateEvent);
				break;
			case "GUILD_INTEGRATIONS_UPDATE":
				this.emit("GUILD_INTEGRATIONS_UPDATE", payload.d as Discord.guild.IntegrationsUpdateEvent);
				break;
			case "GUILD_MEMBER_ADD":
				this.emit("GUILD_MEMBER_ADD", payload.d as Discord.guild.MemberAddEvent);
				break;
			case "GUILD_MEMBER_REMOVE":
				this.emit("GUILD_MEMBER_REMOVE", payload.d as Discord.guild.MemberRemoveEvent);
				break;
			case "GUILD_MEMBER_UPDATE":
				this.emit("GUILD_MEMBER_UPDATE", payload.d as Discord.guild.MemberUpdateEvent);
				break;
			case "GUILD_MEMBERS_CHUNK":
				this.emit("GUILD_MEMBERS_CHUNK", payload.d as Discord.guild.MembersChunkEvent);
				break;
			case "GUILD_ROLE_CREATE":
				this.emit("GUILD_ROLE_CREATE", payload.d as Discord.role.UpdateEvent);
				break;
			case "GUILD_ROLE_UPDATE":
				this.emit("GUILD_ROLE_UPDATE", payload.d as Discord.role.UpdateEvent);
				break;
			case "GUILD_ROLE_DELETE":
				this.emit("GUILD_ROLE_DELETE", payload.d as Discord.role.DeleteEvent);
				break;
			//endregion

			//region Invite
			case "INVITE_CREATE":
				this.emit("INVITE_CREATE", payload.d as Discord.invite.CreateEvent);
				break;
			case "INVITE_DELETE":
				this.emit("INVITE_DELETE", payload.d as Discord.invite.DeleteEvent);
				break;
			//endregion

			//region Message
			case "MESSAGE_CREATE":
				this.emit("MESSAGE_CREATE", payload.d as Discord.message.Message);
				break;
			case "MESSAGE_UPDATE":
				this.emit("MESSAGE_UPDATE", payload.d as Discord.message.Message);
				break;
			case "MESSAGE_DELETE":
				this.emit("MESSAGE_DELETE", payload.d as Discord.message.DeleteEvent);
				break;
			case "MESSAGE_DELETE_BULK":
				this.emit("MESSAGE_DELETE_BULK", payload.d as Discord.channel.DeleteBulkEvent);
				break;
			case "MESSAGE_REACTION_ADD":
				this.emit("MESSAGE_REACTION_ADD", payload.d as Discord.message.ReactionAddEvent);
				break;
			case "MESSAGE_REACTION_REMOVE":
				this.emit("MESSAGE_REACTION_REMOVE", payload.d as Discord.message.ReactionRemoveEvent);
				break;
			case "MESSAGE_REACTION_REMOVE_ALL":
				this.emit("MESSAGE_REACTION_REMOVE_ALL", payload.d as Discord.message.ReactionRemoveAllEvent);
				break;
			case "MESSAGE_REACTION_REMOVE_EMOJI":
				this.emit("MESSAGE_REACTION_REMOVE_EMOJI", payload.d as Discord.message.ReactionRemoveEmojiEvent);
				break;
			//endregion

			//region Presence
			case "PRESENCE_UPDATE":
				this.emit("PRESENCE_UPDATE", payload.d as Discord.guild.PresenceUpdateEvent);
				break;
			case "TYPING_START":
				this.emit("TYPING_START", payload.d as Discord.channel.TypingStartEvent);
				break;
			case "USER_UPDATE":
				this.emit("USER_UPDATE", payload.d as Discord.user.User);
				break;
			//endregion

			//region Voice
			case "VOICE_STATE_UPDATE":
				this.emit("VOICE_STATE_UPDATE", payload.d as Discord.voice.State);
				break;
			case "VOICE_SERVER_UPDATE":
				this.emit("VOICE_SERVER_UPDATE", payload.d as Discord.voice.ServerUpdateEvent);
				break;
			//endregion

			case "WEBHOOKS_UPDATE":
				this.emit("WEBHOOKS_UPDATE", payload.d as Discord.webhook.UpdateEvent);
				break;

			default:
				throw new Error("Unexpected event:\n" + payload.t);
		}

		switch (payload.t!) {
			case "RESUMED":
			case "RECONNECT":
			case "INVALID_SESSION":
				break;
			default:
				this.emit("raw", {
					name: payload.t! as keyof events,
					data: payload.d as events[keyof events],
				});
				break;
		}
	}
}
