import { Client } from "../src/Client.ts";

const client = new Client();
await client.connect("TOKEN");
console.log("ready");

for await (const [channel, message] of client.asyncOn("messageCreate")) {
  if (message.content === "!ping") {
    channel?.sendMessage({
      content: `${message.author.mention} pong`,
    });
  }
}
