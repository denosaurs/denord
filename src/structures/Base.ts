import type { Client } from "../Client.ts";
import type { Snowflake } from "../discord.ts";

export abstract class Base<T> {
  client: Client;
  /** The unchanged object received from discord. */
  raw: T;

  protected constructor(client: Client, data: T) {
    this.client = client;
    this.raw = data;
  }
}

export abstract class SnowflakeBase<T extends { id: Snowflake }>
  extends Base<T> {
  /** The id of the object. */
  id: Snowflake;

  protected constructor(client: Client, data: T) {
    super(client, data);

    this.id = data.id;
  }

  /** The unix timestamp this object was created by the discord api. */
  get createdAt(): number {
    return (+this.id / (2 ** 22)) + 1420070400000;
  }
}
