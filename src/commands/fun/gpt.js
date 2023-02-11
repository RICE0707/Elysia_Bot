const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { MESSAGES, EMBED_COLORS } = require("@root/config.js");
const { randomUUID } = require("crypto");

let api;

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "趣味聊天",
  description: "與機器人聊天（使用OpenAI[ChatGPT]技術）",
  cooldown: 5,
  category: "趣味類",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    usage: "<內容>",
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "內容",
        description: "輸入與機器人對話的內容",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },

  async messageRun(message, args) {
    const content = args[0];
    if (!content.length) {
      return message.safeReply(`> <a:r2_rice:868583626227478591> 請輸入對話內容。`);
    }
    const response = await getContent(content, message.author);
    return message.safeReply(response);
  },

  async interactionRun(interaction) {
    const content = interaction.options.getString("內容");
    const response = await getContent(content, interaction.user);
    await interaction.followUp(response);
  },
};

async function installApi() {
  if (api == undefined) {
      const ChatGPTAPI = (await import("@waylaidwanderer/chatgpt-api")).ChatGPTAPI;

      api = new ChatGPTAPI({
          apiKey: process.env.OPENAI_API_KEY
      });
  }

  /*if (api === undefined) {
    const ChatGPT = (await import("chatgpt-official")).default;
    api = new ChatGPT(process.env.OPENAI_API_KEY, {
      instructions: `You are 花瓶, a bot made by RiceChen_. You could answer questions related to wide ranges of topics from fundemental knowledge to complex expertise. Because your knowledge cutoff date is 2021/09, some infomation might be outdated. You will try you best to answer my question. Please explain things to user extremely delicately detailed, and if the user asked you to generate/fixes code, do it and add disclaimer that your output might be false and you tried your best to make them working. You will only use Traditional Chinese to respond to users' questions. If Traditional Chinese cannot fully express the meaning, use English to respond.\n`,
      aiName: '花瓶',
      revProxy: 'https://chatgpt.pawan.krd/conversation'
    });
  }*/
}

async function getModeration(content) {
  return await fetch('https://api.openai.com/v1/moderations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({ input: content })
  })
    .then(res => res.json());
}

async function getContent(content, user) {
  await installApi();
  let response;
  try {
    const moderation = await getModeration(content); // 檢測 NSFW, 等違反 OpenAI ToS 的輸入.

    if (
      Object.values(moderation.results[0].categories)
        .some(category => moderation.results[0].categories[category])
    ) {
      const embed = new EmbedBuilder()
        .setColor(EMBED_COLORS.ERROR)
        .setTitle("看起來你的 Input 有問題!")
        .setFields(
          {
            name: "檢測結果", value: Object.values(moderation.results[0].categories)
              .filter(category => moderation.results[0].categories[category]).join(", ")
          }
        )
        .setTimestamp()
        .setFooter({ text: `來自花瓶星球的科技支援 v3.0 - 取自於 OpenAI`, iconURL: 'https://cdn.discordapp.com/attachments/1067805752183488663/1068501885193039973/1015210055_61696d776b439.jpg' });

      return { embeds: [embed] };
    }

    response = await api.sendMessage(content, {
      promptPrefix: `You are 花瓶, a bot made by RiceChen_. You could answer questions related to wide ranges of topics from fundemental knowledge to complex expertise. Because your knowledge cutoff date is 2021/09, some infomation might be outdated. You will try you best to answer my question. Please explain things to user extremely delicately detailed, and if the user asked you to generate/fixes code, do it and add disclaimer that your output might be false and you tried your best to make them working. You will only use Traditional Chinese to respond to users' questions. If Traditional Chinese cannot fully express the meaning, use English to respond.
      Current date: ${new Date().toISOString()}\n\n`
    });
    // response = await api.ask(content, randomUUID(), user.tag);
  } catch (error) {
    throw error;
    return MESSAGES.API_ERROR;
  }

  const text = response;

  if (text.length > 4050) {
    const embed1 = new EmbedBuilder()
    .setColor(EMBED_COLORS.TRANSPARENT)
    .setFields(
      { name: "回應", value: text.slice(0, 4050) }
    )
    .setTimestamp()
    .setFooter({ text: `來自花瓶星球的科技支援 v3.0 - 取自於 OpenAI`, iconURL: 'https://cdn.discordapp.com/attachments/1067805752183488663/1068501885193039973/1015210055_61696d776b439.jpg' });

    const embed2 = new EmbedBuilder()
    .setColor(EMBED_COLORS.TRANSPARENT)
    .setFields(
      { name: "回應", value: text.slice(4050, text.length - 1) }
    )
    .setTimestamp()
    .setFooter({ text: `來自花瓶星球的科技支援 v3.0 - 取自於 OpenAI`, iconURL: 'https://cdn.discordapp.com/attachments/1067805752183488663/1068501885193039973/1015210055_61696d776b439.jpg' });

    return { embeds: [embed1, embed2] };
  }

  const embed = new EmbedBuilder()
    .setColor(EMBED_COLORS.TRANSPARENT)
    .setFields(
      { name: "回應", value: text }
    )
    .setTimestamp()
    .setFooter({ text: `來自花瓶星球的科技支援 v3.0 - 取自於 OpenAI`, iconURL: 'https://cdn.discordapp.com/attachments/1067805752183488663/1068501885193039973/1015210055_61696d776b439.jpg' });

  return { embeds: [embed] };
}