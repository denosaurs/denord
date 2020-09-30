import {
  connectWebSocket,
  isWebSocketCloseEvent,
  Opus,
  sodium,
  WebSocket,
} from "../../deps.ts";
import type { Snowflake } from "../discord.ts";

await Opus.load();
const opus = new Opus(48000, 2);

let ws: WebSocket;
let wsSeq = 0;
let udpSeq = Math.floor(Math.random() * 2 ** 16);
let beatInterval;
let ACKed = true;
let conn: Deno.DatagramConn;
let ssrc: number;
let ssrcByte: Uint8Array;
let key: Uint8Array;
let addr: Deno.NetAddr;

function wsSend(data: unknown) {
  return ws.send(JSON.stringify(data));
}

function beat() {
  wsSeq = Math.floor(Math.random() * 1e5);
  wsSend({
    op: 3,
    d: wsSeq,
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
  ws = await connectWebSocket(`wss://${data.ip}/?v=4`);
  wsSend({
    op: 0,
    d: {
      server_id: data.guildId,
      user_id: data.userId,
      session_id: data.sessionId,
      token: data.token,
    },
  });
  listener(data);
}

async function listener(data: ConnectionDataInit["data"]) {
  for await (const msg of ws) {
    if (typeof msg === "string") {
      const data = JSON.parse(msg);
      console.log(data.op);
      switch (data.op) {
        case 8:
          startBeating(data.d.heartbeat_interval);
          break;
        case 6:
          if (data.d === wsSeq) {
            ACKed = true;
          } else {
            throw new Error("bad ack");
          }
          break;
        case 2: {
          ssrc = data.d.ssrc;
          ssrcByte = new Uint8Array(new Uint32Array([data.d.ssrc]).buffer);
          const randomPort = Math.floor((Math.random() * 10000) + 50000);
          conn = Deno.listenDatagram({
            transport: "udp",
            hostname: "0.0.0.0",
            port: randomPort,
          });

          // Create discovery packet:
          const discovery = new Uint8Array(74);
          discovery.set([0, 1], 0); // Packet type
          discovery.set([0, 70], 2); // Packet length
          discovery.set(ssrcByte, 4); // SSRC

          // The last two fields of the IP discovery packet (address and port)
          // are only populated in the response, so we leave them empty.

          await conn.send(discovery, {
            transport: "udp",
            hostname: data.d.ip,
            port: data.d.port,
          });
          const [dat] = await conn.receive();

          // Decode packet
          const ipRaw = dat.slice(8, 72);
          const portRaw = dat.slice(72, 74);
          const ip = new TextDecoder().decode(ipRaw);
          const port = portRaw[0] + (portRaw[1] << 8);

          addr = {
            transport: "udp",
            hostname: ip,
            port: port,
          };

          // Register handler with packet
          wsSend({
            op: 1,
            d: {
              protocol: "udp",
              address: ip,
              port: port,
              mode: "xsalsa20_poly1305",
            },
          });

          self.postMessage({name: "CONNECTED"});
          break;
        }
        case 4:
          key = new Uint8Array(data.d.secret_key);
          break;
        default:
          console.log(data);
          break;
      }
    } else if (isWebSocketCloseEvent(msg)) {
      console.log(msg);
      switch (msg.code) {
        case 1000:
          reconnect(data);
          break;
        case 4006:
          connect(data);
          break;
      }
    }
  }
}

async function reconnect(data: ConnectionDataInit["data"]) {
  ws = await connectWebSocket(`wss://${data.ip}/?v=4`);
  wsSend({
    op: 7,
    d: {
      server_id: data.guildId,
      session_id: data.sessionId,
      token: data.token,
    },
  });
  listener(data);
}

async function disconnect() {
  await ws.close();
  conn.close();
  opus.delete();
  self.postMessage({
    name: "DISCONNECTED",
  });
  self.close();
}

async function sendAudio(voiceData: Uint8Array) {
  const encoded = opus.encode(voiceData, 960);

  const rtp = new Uint8Array(12);
  rtp[0] = 0x80;
  rtp[1] = 0x78;
  rtp.set(new Uint8Array(new Uint16Array([udpSeq]).buffer), 2);
  rtp.set(new Uint8Array(new Uint32Array([Date.now()]).buffer), 4);
  rtp.set(ssrcByte, 8);
  const data = new Uint8Array(rtp.byteLength + encoded.byteLength);
  data.set(rtp, 0);
  data.set(encoded, 12);

  if (udpSeq == 2 ** 16) {
    udpSeq = 0;
  } else {
    ++udpSeq;
  }

  const nonce = new Uint8Array(24);
  nonce.set(rtp, 0);

  const encrypted = sodium.crypto_secretbox_easy(data, nonce, key);
  console.log("bar");

  await conn.send(encrypted, addr);
}

function speak(priority: boolean) {
  return wsSend({
    op: 5,
    d: {
      speaking: (1 << 0) | (priority ? (1 << 0) : 0),
      delay: 0,
      ssrc,
    },
  });
}

function stopSpeak() {
  return wsSend({
    op: 5,
    d: {
      speaking: 0,
      delay: 0,
      ssrc,
    },
  });
}

type ConnectionData =
  | ConnectionDataInit
  | ConnectionDataDisconnect
  | ConnectionDataStartSpeak
  | ConnectionDataStopSpeak
  | ConnectionDataSendAudio;

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

interface ConnectionDataStartSpeak {
  name: "START_SPEAK";
  data: boolean;
}

interface ConnectionDataStopSpeak {
  name: "STOP_SPEAK";
}

interface ConnectionDataSendAudio {
  name: "SEND_AUDIO";
  data: Record<string, number>;
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
    case "START_SPEAK": {
      await speak(event.data);
      break;
    }
    case "STOP_SPEAK": {
      await stopSpeak();
      break;
    }
    case "SEND_AUDIO": {
      const dat = Uint8Array.from(Object.values(event.data));
      await sendAudio(dat);
      break;
    }
  }
};
