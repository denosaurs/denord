import type { gateway, Snowflake } from "../discord.ts";
import {
  connectWebSocket,
  isWebSocketCloseEvent,
  WebSocket,
} from "../../deps.ts";
import { URLs } from "../utils/utils.ts";

class Shard {
  token!: string;
  intents: number;
  socket!: WebSocket;
  heartbeat!: number;
  sessionId!: string;
  seq: number | null = null;
  ACKed = false;
  beatInterval!: number;
  shardN: number;
  maxShards: number;

  constructor(shardN: number, maxShards: number, intents: number) {
    this.shardN = shardN;
    this.maxShards = maxShards;
    this.intents = intents;
  }

  private send(data: unknown) {
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

  private async listener() {
    for await (const msg of this.socket) {
      if (typeof msg === "string") {
        const payload = JSON.parse(msg) as gateway.Payload;
        switch (payload.op) {
          case 0:
            this.seq = payload.s;

            switch (payload.t) {
              case "RECONNECT":
                this.reconnect();
                break;
              case "READY":
                this.sessionId = payload.d.session_id;
                break;
            }

            self.postMessage({
              name: "EVENT",
              data: payload,
            });
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
              this.connect(this.token);
            }
            break;
          case 11:
            this.ACKed = true;
            break;
          default:
            // deno-lint-ignore ban-ts-comment
            // @ts-ignore
            throw new Error(`${self.name}: unexpected op: ${payload}`);
        }
      } else if (isWebSocketCloseEvent(msg)) {
        switch (msg.code) {
          case 1000:
            clearInterval(this.beatInterval);
            self.postMessage({ name: "CLOSE" });
            break;
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
          case 4010:
          case 4012:
            throw new Error(`Please file an issue.\nOpcode: ${msg.code}`);
          case 4013:
            throw new Error(`You provided invalid intents`);
          case 4014:
            throw new Error(
              "You provided an intent that you are not allowed to use",
            );
          case 4011:
            throw new Error("You are not using enough shards");

          default:
            // deno-lint-ignore ban-ts-comment
            // @ts-ignore
            throw new Error(`${self.name}: Unexpected opcode ${msg.code}`);
        }
      }
    }
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

    this.socket = await connectWebSocket(URLs.Gateway);

    let firstPayload = JSON.parse(
      (await this.socket[Symbol.asyncIterator]().next()).value,
    ) as gateway.Payload;
    if (firstPayload.op === 10) {
      this.heartbeat = firstPayload.d.heartbeat_interval;
      this.send({
        op: 2,
        d: {
          token: this.token,
          intents: this.intents,
          shard: [this.shardN, this.maxShards],
          properties: {
            $os: Deno.build.os,
            $browser: "Denord",
            $device: "Denord",
          },
        },
      });
    } else {
      throw new Error(
        // deno-lint-ignore ban-ts-comment
        // @ts-ignore
        `${self.name}: Expected HELLO, received ${firstPayload.op}`,
      );
    }

    this.listener();
    this.startBeating();
  }

  guildRequestMember(data: gateway.GuildRequestMembers) {
    this.send({
      op: 8,
      d: data,
    });
  }

  statusUpdate(data: gateway.StatusUpdate) {
    this.send({
      op: 3,
      d: data,
    });
  }

  voice(guildId: Snowflake, channelId: Snowflake) {
    this.send({
      op: 4,
      d: {
        guild_id: guildId,
        channel_id: channelId,
        self_mute: false,
        self_deaf: false,
      },
    });
  }
}

let shard: Shard;

type ShardData =
  | ShardDataInit
  | ShardDataToken
  | ShardDataGuildRequestMember
  | ShardDataStatusUpdate
  | ShardDataVoice;

interface ShardDataVoice {
  name: "VOICE";
  data: {
    guildId: Snowflake;
    channelId: Snowflake;
  };
}

interface ShardDataInit {
  name: "INIT";
  data: {
    shardN: number;
    maxShards: number;
    intents: number;
  };
}

interface ShardDataToken {
  name: "CONNECT";
  data: string;
}

interface ShardDataGuildRequestMember {
  name: "GUILD_REQUEST_MEMBER";
  data: gateway.GuildRequestMembers;
}

interface ShardDataStatusUpdate {
  name: "STATUS_UPDATE";
  data: gateway.StatusUpdate;
}

self.onmessage = async (msg: MessageEvent) => {
  const event = msg.data as ShardData;
  switch (event.name) {
    case "INIT":
      shard = new Shard(
        event.data.shardN,
        event.data.maxShards,
        event.data.intents,
      );
      break;
    case "CONNECT":
      await shard.connect(event.data);
      self.postMessage({
        name: "CONNECT_NEXT",
        data: event.data,
      });
      break;
    case "GUILD_REQUEST_MEMBER":
      shard.guildRequestMember(event.data);
      break;
    case "STATUS_UPDATE":
      shard.statusUpdate(event.data);
      break;
    case "VOICE":
      shard.voice(event.data.guildId, event.data.channelId);
      break;
  }
};
