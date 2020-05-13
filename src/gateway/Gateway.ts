// @deno-types="../discord.d.ts"

import {
  connectWebSocket,
  isWebSocketCloseEvent,
  WebSocket,
} from "https://deno.land/std@0.50.0/ws/mod.ts";
import EventEmitter from "https://deno.land/std@0.50.0/node/events.ts";

type Events = Discord.gateway.Events;

interface rawEvents extends Events {
  raw: {
    name: keyof Events;
    data: Events[keyof Events];
  };
}

export interface Gateway {
  emit<T extends keyof rawEvents>(eventName: T, args: rawEvents[T]): boolean;

  on<T extends keyof rawEvents>(
    eventName: T,
    listener: (args: rawEvents[T]) => void,
  ): this;

  off<T extends keyof rawEvents>(
    eventName: T,
    listener: (args: rawEvents[T]) => void,
  ): this;
}

//TODO sharding and send opcode 3 & 8
export class Gateway extends EventEmitter {
  token!: string;
  intents: number | undefined;
  socket!: WebSocket;
  heartbeat!: number;
  sessionId!: string;
  seq: number | null = null;
  ACKed: boolean = false;
  beatInterval!: number;

  constructor(intents?: number) {
    super();

    this.intents = intents;
  }

  private send(data: any) {
    this.socket.send(JSON.stringify(data));
  }

  private beat() {
    this.send({
      op: 1,
      d: this.seq,
    });
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
    this.connect(this.token);
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

  async connect(token: string) {
    this.token = token;

    this.socket = await connectWebSocket(
      "wss://gateway.discord.gg/?v=6&encoding=json",
    );

    let firstPayload = JSON.parse(
      (await this.socket[Symbol.asyncIterator]()
        .next()).value,
    ) as Discord.gateway.Payload;
    if (firstPayload.op === 10) {
      this.heartbeat = firstPayload.d.heartbeat_interval;
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
            if (payload.d) {
              this.reconnect();
            } else {
              clearInterval(this.beatInterval);
            }
            break;
          case 11:
            this.ACKed = true;
            break;
          default:
            throw new Error("unexpected op: " + payload);
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
            throw new Error(
              "You provided an intent that you are not allowed to use!",
            );
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

  private async event(
    payload: Discord.gateway.SpecificEventPayload<keyof Events>,
  ) {
    this.seq = payload.s;

    switch (payload.t) {
      case "RESUMED":
        break;
      case "RECONNECT":
        this.reconnect();
        break;

      case "READY":
        this.sessionId = payload.d.session_id;
      case "CHANNEL_CREATE":
      case "CHANNEL_UPDATE":
      case "CHANNEL_DELETE":
      case "CHANNEL_PINS_UPDATE":
      case "GUILD_CREATE":
      case "GUILD_UPDATE":
      case "GUILD_DELETE":
      case "GUILD_BAN_ADD":
      case "GUILD_BAN_REMOVE":
      case "GUILD_EMOJIS_UPDATE":
      case "GUILD_INTEGRATIONS_UPDATE":
      case "GUILD_MEMBER_ADD":
      case "GUILD_MEMBER_REMOVE":
      case "GUILD_MEMBER_UPDATE":
      case "GUILD_MEMBERS_CHUNK":
      case "GUILD_ROLE_CREATE":
      case "GUILD_ROLE_UPDATE":
      case "GUILD_ROLE_DELETE":
      case "INVITE_CREATE":
      case "INVITE_DELETE":
      case "MESSAGE_CREATE":
      case "MESSAGE_UPDATE":
      case "MESSAGE_DELETE":
      case "MESSAGE_DELETE_BULK":
      case "MESSAGE_REACTION_ADD":
      case "MESSAGE_REACTION_REMOVE":
      case "MESSAGE_REACTION_REMOVE_ALL":
      case "MESSAGE_REACTION_REMOVE_EMOJI":
      case "PRESENCE_UPDATE":
      case "TYPING_START":
      case "USER_UPDATE":
      case "VOICE_STATE_UPDATE":
      case "VOICE_SERVER_UPDATE":
      case "WEBHOOKS_UPDATE":
        this.emit(payload.t, payload.d);
        this.emit("raw", {
          name: payload.t,
          data: payload.d,
        });
        break;

      default:
        throw new Error("Unexpected event: " + payload);
    }
  }
}
