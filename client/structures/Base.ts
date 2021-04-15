import type { Client } from "../Client.ts";
import type { Snowflake } from "../../discord_typings/mod.ts";

export abstract class Base<T> {
  client: Client;
  /** The raw object received from discord when this instance was created. */
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
