import type { guild, Snowflake } from "../discord/mod.ts";

export interface WelcomeScreen {
  description: string | null;
  channels: WelcomeScreenChannel[];
}

export interface WelcomeScreenChannel {
  channelId: Snowflake;
  description: string;
  emojiId: Snowflake | null;
  emojiName: string | null;
}

export function parseWelcomeScreen(
  { description, welcome_channels }: guild.WelcomeScreen,
): WelcomeScreen {
  return {
    description,
    channels: welcome_channels.map((channel) => ({
      channelId: channel.channel_id,
      description: channel.description,
      emojiId: channel.emoji_id,
      emojiName: channel.emoji_name,
    })),
  };
}
