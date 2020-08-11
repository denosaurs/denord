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

export class ShardManager extends EventEmitter<rawEvents> {
  readonly shardsAmount: number;
  #workers: Worker[] = [];

  constructor(shardAmount: number, intents?: number) {
    super();

    this.shardsAmount = shardAmount;

    for (let i = 0; i < shardAmount; i++) {
      let worker = new Worker(new URL("Shard.ts", import.meta.url).href, {
        type: "module",
        name: i.toString(),
        deno: true,
      });

      worker.onmessage = (msg) => {
        let event = msg.data as { name: string; data: any };

        switch (event.name) {
          case "event":
            let payload = event.data as gateway.SpecificEventPayload<
              keyof Events
            >;

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
          case "close":
            console.log(`Shard ${i} closed`);
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

      this.#workers.push(worker);
    }
  }

  connect(token: string) { //TODO: 5 second interval between each connection
    for (const worker of this.#workers) {
      worker.postMessage({
        name: "CONNECT",
        data: token,
      });
    }
  }

  guildRequestMember(shard: number, data: gateway.GuildRequestMembers) {
    this.#workers[shard].postMessage({
      name: "GUILD_REQUEST_MEMBER",
      data,
    });
  }

  statusUpdate(shard: number, data: gateway.StatusUpdate) {
    this.#workers[shard].postMessage({
      name: "STATUS_UPDATE",
      data,
    });
  }
}
