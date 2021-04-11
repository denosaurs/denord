# denord

[![Tags](https://img.shields.io/github/release/denosaurs/denord)](https://github.com/denosaurs/denord/releases)
[![CI Status](https://img.shields.io/github/workflow/status/denosaurs/denord/check)](https://github.com/denosaurs/denord/actions)
[![Dependencies](https://img.shields.io/github/workflow/status/denosaurs/denord/depsbot?label=dependencies)](https://github.com/denosaurs/depsbot)
[![License](https://img.shields.io/github/license/denosaurs/denord)](https://github.com/denosaurs/denord/blob/master/LICENSE)

---

> ⚠️ Work in progress. Expect breaking changes.

---

Denord is a module to interact with the discord API.

For event handling, the [event](https://github.com/denosaurs/event) module is
used.

## Example

```ts
import { Client } from "https://deno.land/x/denord/src/Client.ts";

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
```

## Maintainers

- crowlKats ([@crowlKats](https://github.com/crowlKats))
- Filippo Rossi ([@qu4k](https://github.com/qu4k))

## Other

### Contribution

Pull request, issues and feedback are very welcome. Code style is formatted with
`deno fmt` and commit messages are done following Conventional Commits spec.

### Licence

Copyright 2020-present, the denosaurs team. All rights reserved. MIT license.
