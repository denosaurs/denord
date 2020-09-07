import { SnowflakeBase } from "./Base.ts";
import type { Client } from "../Client.ts";
import type { channel } from "../discord.ts";
import { inverseMap } from "../utils/utils.ts";

const typeMap = {
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
  type: keyof typeof inverseTypeMap;

  protected constructor(client: Client, data: channel.BaseChannel) {
    super(client, data);

    this.type = typeMap[data.type];
  }
}
