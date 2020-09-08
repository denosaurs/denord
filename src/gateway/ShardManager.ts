import type { gateway } from "../discord.ts";
import EventEmitter from "../utils/EventEmitter.ts";

type Events = gateway.Events;

type BundledEvent<K extends keyof Events> = {
  name: K;
  data: Events[K];
};
type BundledEvents<T extends keyof Events> = T extends keyof Events
  ? BundledEvent<T>
  : never;

interface RawEvents extends Events {
  raw: BundledEvents<keyof Events>;
}

type ValueToTupleValue<T> = {
  [K in keyof T]: [T[K]];
}

/**
 * A shard manager that manages all shards that are used to connect to the discord gateway
 */
export class ShardManager extends EventEmitter<ValueToTupleValue<RawEvents>> {
  #shards: Worker[] = [];
  #resolveConnect!: () => void;
  shardAmount: number;

  /**
   * @param shardAmount - The amount of shards to use
   * @param intents - The intents to use when connecting
   */
  constructor(shardAmount: number, intents?: number) {
    super();

    this.shardAmount = shardAmount;

    for (let i = 0; i < shardAmount; i++) {
      const name = `${i}/${shardAmount}`;
      let worker = new Worker(new URL("Shard.ts", import.meta.url).href, {
        type: "module",
        name,
        deno: true,
      });

      worker.onmessage = (msg) => {
        const event = msg.data as { name: string; data: any };

        switch (event.name) {
          case "EVENT": {
            const payload = event.data as gateway.SpecificEvent;

            switch (payload.t) {
              case "READY":
                this.emit(payload.t, payload.d);
                break;
              case "RESUMED":
                this.emit(payload.t, payload.d);
                break;
              case "RECONNECT":
                this.emit(payload.t, payload.d);
                break;
              case "CHANNEL_CREATE":
                this.emit(payload.t, payload.d);
                break;
              case "CHANNEL_UPDATE":
                this.emit(payload.t, payload.d);
                break;
              case "CHANNEL_DELETE":
                this.emit(payload.t, payload.d);
                break;
              case "CHANNEL_PINS_UPDATE":
                this.emit(payload.t, payload.d);
                break;
              case "GUILD_CREATE":
                this.emit(payload.t, payload.d);
                break;
              case "GUILD_UPDATE":
                this.emit(payload.t, payload.d);
                break;
              case "GUILD_DELETE":
                this.emit(payload.t, payload.d);
                break;
              case "GUILD_BAN_ADD":
                this.emit(payload.t, payload.d);
                break;
              case "GUILD_BAN_REMOVE":
                this.emit(payload.t, payload.d);
                break;
              case "GUILD_EMOJIS_UPDATE":
                this.emit(payload.t, payload.d);
                break;
              case "GUILD_INTEGRATIONS_UPDATE":
                this.emit(payload.t, payload.d);
                break;
              case "GUILD_MEMBER_ADD":
                this.emit(payload.t, payload.d);
                break;
              case "GUILD_MEMBER_REMOVE":
                this.emit(payload.t, payload.d);
                break;
              case "GUILD_MEMBER_UPDATE":
                this.emit(payload.t, payload.d);
                break;
              case "GUILD_MEMBERS_CHUNK":
                this.emit(payload.t, payload.d);
                break;
              case "GUILD_ROLE_CREATE":
                this.emit(payload.t, payload.d);
                break;
              case "GUILD_ROLE_UPDATE":
                this.emit(payload.t, payload.d);
                break;
              case "GUILD_ROLE_DELETE":
                this.emit(payload.t, payload.d);
                break;
              case "INVITE_CREATE":
                this.emit(payload.t, payload.d);
                break;
              case "INVITE_DELETE":
                this.emit(payload.t, payload.d);
                break;
              case "MESSAGE_CREATE":
                this.emit(payload.t, payload.d);
                break;
              case "MESSAGE_UPDATE":
                this.emit(payload.t, payload.d);
                break;
              case "MESSAGE_DELETE":
                this.emit(payload.t, payload.d);
                break;
              case "MESSAGE_DELETE_BULK":
                this.emit(payload.t, payload.d);
                break;
              case "MESSAGE_REACTION_ADD":
                this.emit(payload.t, payload.d);
                break;
              case "MESSAGE_REACTION_REMOVE":
                this.emit(payload.t, payload.d);
                break;
              case "MESSAGE_REACTION_REMOVE_ALL":
                this.emit(payload.t, payload.d);
                break;
              case "MESSAGE_REACTION_REMOVE_EMOJI":
                this.emit(payload.t, payload.d);
                break;
              case "PRESENCE_UPDATE":
                this.emit(payload.t, payload.d);
                break;
              case "TYPING_START":
                this.emit(payload.t, payload.d);
                break;
              case "USER_UPDATE":
                this.emit(payload.t, payload.d);
                break;
              case "VOICE_STATE_UPDATE":
                this.emit(payload.t, payload.d);
                break;
              case "VOICE_SERVER_UPDATE":
                this.emit(payload.t, payload.d);
                break;
              case "WEBHOOKS_UPDATE":
                this.emit(payload.t, payload.d);
                break;

              default:
                throw new Error("Unexpected event: " + payload);
            }
            this.emit("raw", {
              name: payload.t,
              data: payload.d,
            } as BundledEvents<keyof Events>);
            break;
          }
          case "CLOSE":
            console.log(`Shard ${name} closed`);
            break;
          case "CONNECT_NEXT":
            if (i + 1 < shardAmount) {
              setTimeout(() => {
                this.#shards[i + 1].postMessage({
                  name: "CONNECT",
                  data: event.data,
                });
              }, 5000);
            } else {
              this.#resolveConnect();
            }
            break;
        }
      };

      worker.postMessage({
        name: "INIT",
        data: {
          shardN: i,
          maxShards: shardAmount,
          intents,
        },
      });

      this.#shards.push(worker);
    }
  }

  /**
   * Connects all the shards to the gateway
   *
   * @param token - The token to connect with
   */
  async connect(token: string): Promise<void> {
    return new Promise((resolve) => {
      this.#resolveConnect = resolve;
      this.#shards[0].postMessage({
        name: "CONNECT",
        data: token,
      });
    });
  }

  /**
   * @param shard - The number of the shard to make the request with
   * @param data - The data to make the request with
   */
  guildRequestMember(shard: number, data: gateway.GuildRequestMembers) {
    this.#shards[shard].postMessage({
      name: "GUILD_REQUEST_MEMBER",
      data,
    });
  }

  /**
   * @param shard - The number of the shard to make the request with
   * @param data - The data to make the request with
   */
  statusUpdate(shard: number, data: gateway.StatusUpdate) {
    this.#shards[shard].postMessage({
      name: "STATUS_UPDATE",
      data,
    });
  }
}
