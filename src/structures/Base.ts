import type { Client } from "../Client.ts";
import type { Snowflake } from "../discord.ts";

export abstract class Base<T> {
  client: Client;
  raw: T;

  protected constructor(client: Client, data: T) {
    this.client = client;
    this.raw = data;
  }
}

export abstract class SnowflakeBase<T extends { id: Snowflake }> extends Base<T> {
  id: Snowflake;

  protected constructor(client: Client, data: T) {
    super(client, data);

    this.id = data.id;
  }

  get createdAt() {
    return (+this.id / (2 ** 22)) + 1420070400000;
  }
}
