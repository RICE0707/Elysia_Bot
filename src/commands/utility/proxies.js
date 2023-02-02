const { getBuffer } = require("@helpers/HttpUtils");
const { AttachmentBuilder, ApplicationCommandOptionType } = require("discord.js");

const PROXY_TYPES = ["all", "http", "socks4", "socks5"];

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "實用代理",
  description: "取得代理，可用類型：http, socks4, socks5",
  cooldown: 5,
  category: "其他實用類",
  botPermissions: ["EmbedLinks", "AttachFiles"],
  command: {
    enabled: true,
    usage: "[類型]",
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "類型",
        description: "輸入代理類型",
        type: ApplicationCommandOptionType.String,
        required: true,
        choices: PROXY_TYPES.map((p) => ({ name: p, value: p })),
      },
    ],
  },

  async messageRun(message, args) {
    let type = "全部";

    if (args[0]) {
      if (PROXY_TYPES.includes(args[0].toLowerCase())) type = args[0].toLowerCase();
      else return message.safeReply("> <a:r2_rice:868583626227478591> 無效的選擇，請在這三個選項中選擇其一：` http︱socks4︱socks5 `。");
    }

    const msg = await message.channel.send("> <a:r2_rice:868583626227478591> 花瓶正在獲取代理...");
    const response = await getProxies(type);
    if (msg.deletable) await msg.delete();
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const type = interaction.options.getString("類型");
    await interaction.followUp("> <a:r2_rice:868583626227478591> 花瓶正在獲取代理...");
    const response = await getProxies(type);
    await interaction.editReply(response);
  },
};

async function getProxies(type) {
  const response = await getBuffer(
    `https://api.proxyscrape.com/?request=displayproxies&proxytype=${type}&timeout=10000&country=all&anonymity=all&ssl=all`
  );

  if (!response.success || !response.buffer) return "> <a:r2_rice:868583626227478591> 獲取代理失敗。";
  if (response.buffer.length === 0) return "> <a:r2_rice:868583626227478591> 無法獲取數據，請稍後再嘗試。";

  const attachment = new AttachmentBuilder(response.buffer, { name: `${type.toLowerCase()}_proxies.txt` });
  return { content: `> <a:r3_rice:868583679465758820> ${type.toUpperCase()} 已從 proxyscrape 獲取代理。`, files: [attachment] };
}
