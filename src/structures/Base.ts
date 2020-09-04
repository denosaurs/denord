import { Client } from "../Client.ts";
import type { Snowflake } from "../discord.ts";

export abstract class Base {
  client: Client;
  raw: any; //TODO specific type

  protected constructor(client: Client, data: any) {
    this.client = client;
    this.raw = data;
  }
}

export abstract class SnowflakeBase extends Base {
  id: Snowflake;

  protected constructor(client: Client, data: { id: Snowflake }) {
    super(client, data);

    this.id = data.id;
  }

  get createdAt() {
    return (+this.id / (2 ** 22)) + 1420070400000;
  }
}
