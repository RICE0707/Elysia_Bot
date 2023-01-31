module.exports = {
  OWNER_IDS: "502072207502082048", // Bot owner ID's
  SUPPORT_SERVER: "https://discord.gg/c4tKJME4hE", // Your bot support server
  PREFIX_COMMANDS: {
    ENABLED: true, // Enable/Disable prefix commands
    DEFAULT_PREFIX: "!", // Default prefix for the bot
  },
  INTERACTIONS: {
    SLASH: true, // Should the interactions be enabled
    CONTEXT: true, // Should contexts be enabled
    GLOBAL: true, // Should the interactions be registered globally
    TEST_GUILD_ID: "1069111247494189116", // Guild ID where the interactions should be registered. [** Test you commands here first **]
  },
  EMBED_COLORS: {
    BOT_EMBED: "#D3D7DA",
    TRANSPARENT: "#36393F",
    SUCCESS: "#76FF4D",
    ERROR: "#FF4E4E",
    WARNING: "#FF8C4D",
  },
  CACHE_SIZE: {
    GUILDS: 100,
    USERS: 10000,
    MEMBERS: 10000,
  },
  MESSAGES: {
    API_ERROR: "> <a:r2_rice:868583626227478591> 這很顯然是一個錯誤，請聯繫開發者！",
  },

  // PLUGINS

  AUTOMOD: {
    ENABLED: true,
    LOG_EMBED: "#36393F",
    DM_EMBED: "#36393F",
  },

  DASHBOARD: {
    enabled: false, // enable or disable dashboard
    baseURL: "http://localhost:8080", // base url
    failureURL: "http://localhost:8080", // failure redirect url
    port: "8080", // port to run the bot on
  },

  ECONOMY: {
    ENABLED: true,
    CURRENCY: "元",
    DAILY_COINS: 100, // coins to be received by daily command
    MIN_BEG_AMOUNT: 100, // minimum coins to be received when beg command is used
    MAX_BEG_AMOUNT: 2500, // maximum coins to be received when beg command is used
  },

  MUSIC: {
    ENABLED: true,
    IDLE_TIME: 60, // Time in seconds before the bot disconnects from an idle voice channel
    MAX_SEARCH_RESULTS: 5,
    DEFAULT_SOURCE: "YT", // YT = Youtube, YTM = Youtube Music, SC = SoundCloud
    // Add any number of lavalink nodes here
    // Refer to https://github.com/freyacodes/Lavalink to host your own lavalink server
    LAVALINK_NODES: [
      {
        host: "localhost",
        port: 2333,
        password: "youshallnotpass",
        id: "Local Node",
        secure: false,
      },
    ],
  },

  GIVEAWAYS: {
    ENABLED: true,
    REACTION: "🎁",
    START_EMBED: "#FF468A",
    END_EMBED: "#FF468A",
  },

  IMAGE: {
    ENABLED: true,
    BASE_API: "https://strangeapi.fun/api",
  },

  INVITE: {
    ENABLED: true,
  },

  MODERATION: {
    ENABLED: true,
    EMBED_COLORS: {
      TIMEOUT: "#FF8C4D",
      UNTIMEOUT: "#76FF4D",
      KICK: "#FF4E4E",
      SOFTBAN: "#FF8C4D",
      BAN: "#FF4E4E",
      UNBAN: "#76FF4D",
      VMUTE: "#FF8C4D",
      VUNMUTE: "#FF8C4D",
      DEAFEN: "#FF8C4D",
      UNDEAFEN: "#76FF4D",
      DISCONNECT: "#F4FF4B",
      MOVE: "#F4FF4B",
    },
  },

  PRESENCE: {
    ENABLED: true, // Whether or not the bot should update its status
    STATUS: "dnd", // The bot's status [online, idle, dnd, invisible]
    TYPE: "COMPETING", // Status type for the bot [PLAYING | LISTENING | WATCHING | COMPETING]
    MESSAGE: "花瓶的操你媽Js時光 - {members} 位成員與 {servers} 個群組 使用中。", // Your bot status message
  },

  STATS: {
    ENABLED: true,
    XP_COOLDOWN: 5, // Cooldown in seconds between messages
    DEFAULT_LVL_UP_MSG: "{member:tag}，你剛剛已升級至 **等級：{level}**",
  },

  SUGGESTIONS: {
    ENABLED: true, // Should the suggestion system be enabled
    EMOJI: {
      UP_VOTE: "⬆️",
      DOWN_VOTE: "⬇️",
    },
    DEFAULT_EMBED: "#D3D7DA",
    APPROVED_EMBED: "#76FF4D",
    DENIED_EMBED: "#FF4E4E",
  },

  TICKET: {
    ENABLED: true,
    CREATE_EMBED: "#068ADD",
    CLOSE_EMBED: "#068ADD",
  },
};
