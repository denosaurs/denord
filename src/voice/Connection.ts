import {
  connectWebSocket,
  isWebSocketCloseEvent,
  WebSocket,
} from "../../deps.ts";
import type { Snowflake } from "../discord.ts";

let ws: WebSocket;
let seq = 0;
let beatInterval;
let ACKed = true;
let conn: Deno.DatagramConn;
let key: Uint8Array;

function wsSend(data: unknown) {
  ws.send(JSON.stringify(data));
}

function beat() {
  seq = Math.floor(Math.random() * 1e5);
  wsSend({
    op: 3,
    d: seq,
  });
}

function startBeating(heartbeat: number) {
  beat();

  beatInterval = setInterval(() => {
    if (ACKed) {
      ACKed = false;
      beat();
    } else {
      ws.close(1008);
    }
  }, heartbeat);
}

async function connect(data: ConnectionDataInit["data"]) {
  ws = await connectWebSocket("wss://" + data.ip);
  wsSend({
    op: 0,
    d: {
      server_id: data.guildId,
      user_id: data.userId,
      session_id: data.sessionId,
      token: data.token,
    },
  });
  listener();
}

async function listener() {
  for await (const msg of ws) {
    if (typeof msg === "string") {
      const data = JSON.parse(msg);
      switch (data.op) {
        case 8:
          startBeating(data.d.heartbeat_interval);
          break;
        case 3:
          if (data.d === seq) {
            ACKed = true;
          } else {
            throw new Error("bad ack");
          }
          break;
        case 2: {
          console.log(data.d);
          conn = Deno.listenDatagram({
            transport: "udp",
            hostname: data.d.ip,
            port: data.d.port,
          });

          /*const discovery = new Uint8Array(74);
          discovery[0] = 0;
          discovery[1] = 1;
          discovery[2] = 0;
          discovery[3] = 70;
          discovery.set(new Uint8Array(new Uint32Array([data.d.ssrc]).buffer), 4);
          const address = new Uint8Array(64);
          const encoder = new TextEncoder();
          encoder.encodeInto(data.d.ip + "\0", address);
          discovery.set(address, 8);
          discovery.set(new Uint8Array(new Uint16Array([data.d.port]).buffer), 72);
          conn.send(discovery, conn.addr);
          const [dat, addr] = await conn.receive();
          console.log(dat, addr);*/

          /*send({
            op: 1,
            d: {
              protocol: "udp",
              address: data.d.ip,
              port: data.d.port,
              mode: "xsalsa20_poly1305_lite"
            }
          });*/

          break;
        }
        case 4:
          key = new Uint8Array(new Uint32Array(data.d.secret_key).buffer);
          break;
      }
      console.log(data);
    } else if (isWebSocketCloseEvent(msg)) {
      console.log(msg);
    }
  }
}

async function disconnect() {
  await ws.close();
  conn.close();
  self.postMessage({
    name: "DISCONNECTED",
  });
  self.close();
}

type ConnectionData = ConnectionDataInit | ConnectionDataDisconnect;

interface ConnectionDataInit {
  name: "INIT";
  data: {
    guildId: Snowflake;
    userId: Snowflake;
    sessionId: string;
    token: string;
    ip: string;
  };
}

interface ConnectionDataDisconnect {
  name: "DISCONNECT";
}

self.onmessage = async (msg) => {
  const event = msg.data as ConnectionData;

  switch (event.name) {
    case "INIT":
      await connect(event.data);
      break;
    case "DISCONNECT":
      await disconnect();
      break;
  }
};
