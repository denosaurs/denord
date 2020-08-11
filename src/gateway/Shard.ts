import type { gateway } from "../discord.ts";
import {
  connectWebSocket,
  isWebSocketCloseEvent,
  WebSocket,
} from "../../deps.ts";
import { URLs } from "../utils/utils.ts";

class Shard {
  token!: string;
  intents: number | undefined;
  socket!: WebSocket;
  heartbeat!: number;
  sessionId!: string;
  seq: number | null = null;
  ACKed: boolean = false;
  beatInterval!: number;
  shardN: number;
  maxShards: number;

  constructor(shardN: number, maxShards: number, intents?: number) {
    this.shardN = shardN;
    this.maxShards = maxShards;
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

            postMessage({
              name: "event",
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
            // @ts-ignore
            throw new Error(`${self.name}: unexpected op: ${payload}`);
        }
      } else if (isWebSocketCloseEvent(msg)) {
        switch (msg.code) {
          case 1000:
            clearInterval(this.beatInterval);
            postMessage({ name: "close" });
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
            throw new Error(
              "You are not using enough shards",
            );

          default:
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
            "$os": Deno.build.os,
            "$browser": "Denord",
            "$device": "Denord",
          },
        },
      });
    } else {
      throw new Error(
        // @ts-ignore
        `${self.name}: Expected HELLO, received ${firstPayload.op}`,
      );
    }

    this.listener();
    this.startBeating();
  }

  guildRequestMember(data: gateway.GuildRequestMembers) {
    this.send({
      "op": 8,
      "d": data,
    });
  }

  statusUpdate(data: gateway.StatusUpdate) {
    this.send({
      "op": 3,
      "d": data,
    });
  }
}

let shard: Shard;

// @ts-ignore
onmessage = (msg: MessageEvent) => {
  let event = msg.data as { name: string; data: any };
  switch (event.name) {
    case "INIT":
      shard = new Shard(
        event.data.shardN,
        event.data.maxShards,
        event.data.intents,
      );
      break;
    case "CONNECT":
      shard.connect(event.data);
      break;
    case "GUILD_REQUEST_MEMBER":
      shard.guildRequestMember(event.data);
      break;
    case "STATUS_UPDATE":
      shard.statusUpdate(event.data);
      break;
  }
};
