import type { activity, guild, Snowflake } from "../discord.ts";
import { Emoji, parseEmoji } from "./Emoji.ts";
import type { Client } from "../Client.ts";

type ActiveStatus = guild.ActiveStatus | "offline";

export interface Presence {
  userId: Snowflake;
  roles: Snowflake[];
  game: Activity | null;
  guildId: Snowflake;
  status: ActiveStatus;
  activities: Activity[];
  clientStatus: ClientStatus;
  premiumSince?: number | null;
  nickname?: string | null;
}

interface ClientStatus {
  desktop: ActiveStatus;
  mobile: ActiveStatus;
  web: ActiveStatus;
}

interface Activity {
  name: string;
  type: typeof typeMap[keyof typeof typeMap];
  url?: string | null;
  createdAt: number;
  timestamps?: activity.Timestamps;
  applicationId?: Snowflake;
  emoji?: Emoji | null;
  party?: activity.Party;
  assets?: Assets;
  secrets?: activity.Secrets;
  instance?: boolean;
  flags?: Record<keyof typeof flagsMap, boolean>;
}

interface Assets {
  largeImage?: string;
  largeText?: string;
  smallImage?: string;
  smallText?: string;
}

const typeMap = {
  0: "game",
  1: "streaming",
  2: "listening",
  4: "custom"
} as const;

const flagsMap = {
  "instance": 0x01,
  "join": 0x02,
  "spectate": 0x04,
  "joinRequest": 0x08,
  "sync": 0x10,
  "play": 0x20,
} as const;

export function parsePresence(client: Client, {user, guild_id, premium_since, client_status, game, nick, activities, ...presence}: guild.PresenceUpdateEvent): Presence {
  return {
    ...presence,
    userId: user.id,
    game: game && parseActivity(client, game),
    guildId: guild_id,
    activities: activities.map(activity => parseActivity(client, activity)),
    clientStatus: {
      desktop: client_status.desktop ?? "offline",
      mobile: client_status.mobile ?? "offline",
      web: client_status.web ?? "offline",
    },
    premiumSince: premium_since ? Date.parse(premium_since) : premium_since as null | undefined,
    nickname: nick,
  }
}

function parseActivity(client: Client, {type, created_at, application_id, emoji, assets, flags, ...activity}: activity.Activity): Activity {
  const newFlags = flags ?? 0;

  let parsedFlags = {} as Record<keyof typeof flagsMap, boolean>;

  for (const [key, val] of Object.entries(flagsMap)) {
    parsedFlags[key as keyof typeof flagsMap] = ((newFlags & val) === val);
  }

  return {
    ...activity,
    type: typeMap[type],
    createdAt: created_at,
    applicationId: application_id,
    emoji: emoji && parseEmoji(client, emoji),
    assets: assets && {
      largeImage: assets.large_image,
      largeText: assets.large_text  ,
      smallImage: assets.small_image,
      smallText: assets.small_text,
    },
    flags: parsedFlags,
  }
}
