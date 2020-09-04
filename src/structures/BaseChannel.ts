import { SnowflakeBase } from "./Base.ts";
import { Client } from "../Client.ts";
import type { channel } from "../discord.ts";
import { inverseMap } from "../utils/utils.ts";

export const typeMap = {
  0: "text",
  1: "DM",
  2: "voice",
  3: "groupDM",
  4: "category",
  5: "news",
  6: "store",
} as const;

export const inverseTypeMap = inverseMap(typeMap);

export abstract class BaseChannel extends SnowflakeBase {
  type: typeof typeMap[keyof typeof typeMap];

  protected constructor(client: Client, data: channel.BaseChannel) {
    super(client, data);

    this.type = typeMap[data.type];
  }

  async delete() {
    return this.client.newChannelSwitch(
      await this.client.rest.deleteChannel(this.id),
    );
  }
}