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

interface rawEvents extends Events {
  raw: BundledEvents<keyof Events>;
}

/**
 * A shard manager that manages all shards that are used to connect to the discord gateway
 */
export class ShardManager extends EventEmitter<rawEvents> {
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
        let event = msg.data as { name: string; data: any };

        switch (event.name) {
          case "EVENT": {
            const payload = event.data as gateway.SpecificEventPayload<keyof Events>;

            switch (payload.t) {
              case "READY":
              case "RESUMED":
              case "RECONNECT":
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
                } as BundledEvents<keyof Events>); //TODO: don't cast
                break;

              default:
                throw new Error("Unexpected event: " + payload);
            }
            break;
          }
          case "CLOSE":
            console.log(`Shard ${name} closed`);
            break;
          case "CONNECT_NEXT":
            if (i + 1 < shardAmount) {
              this.#shards[i + 1].postMessage({
                name: "CONNECT",
                data: event.data,
              });
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
