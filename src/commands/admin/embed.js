const {
  ApplicationCommandOptionType,
  ChannelType,
  ModalBuilder,
  ActionRowBuilder,
  TextInputBuilder,
  TextInputStyle,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  EmbedBuilder,
} = require("discord.js");
const { isValidColor, isHex } = require("@helpers/Utils");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "管理創建嵌入消息",
  description: "發送嵌入消息",
  category: "ADMIN",
  userPermissions: ["ManageMessages"],
  command: {
    enabled: true,
    usage: "<頻道>",
    minArgsCount: 1,
    aliases: ["say"],
  },
  slashCommand: {
    enabled: true,
    ephemeral: true,
    options: [
      {
        name: "頻道",
        description: "選擇發送嵌入訊息的頻道",
        type: ApplicationCommandOptionType.Channel,
        channelTypes: [ChannelType.GuildText],
        required: true,
      },
    ],
  },

  async messageRun(message, args) {
    const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]);
    if (!channel) return message.reply("> <a:r2_rice:868583626227478591> 請輸入正確的頻道名稱。");
    if (channel.type !== ChannelType.GuildText) return message.reply("> <a:r2_rice:868583626227478591> 請輸入正確的頻道名稱。");
    if (!channel.canSendEmbeds()) {
      return message.reply("> <a:r2_rice:868583626227478591> 花瓶沒有權限在指定頻道發送嵌入訊息。");
    }
    message.reply(`> <a:r3_rice:868583679465758820> 請在\` ${channel} \`中設置嵌入訊息。`);
    await embedSetup(channel, message.member);
  },

  async interactionRun(interaction) {
    const channel = interaction.options.getChannel("頻道");
    if (!channel.canSendEmbeds()) {
      return interaction.followUp("> <a:r2_rice:868583626227478591> 花瓶沒有權限在指定頻道發送嵌入訊息。");
    }
    interaction.followUp(`> <a:r3_rice:868583679465758820> 請在\` ${channel} \`中設置嵌入訊息。`);
    await embedSetup(channel, interaction.member);
  },
};

/**
 * @param {import('discord.js').GuildTextBasedChannel} channel
 * @param {import('discord.js').GuildMember} member
 */
async function embedSetup(channel, member) {
  const sentMsg = await channel.send({
    content: "> <a:r3_rice:868583679465758820> 請點擊下方按鈕以開始設置嵌入訊息。",
    components: [
      new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("EMBED_ADD").setLabel("點我就對了啦").setStyle(ButtonStyle.Primary)
      ),
    ],
  });

  const btnInteraction = await channel
    .awaitMessageComponent({
      componentType: ComponentType.Button,
      filter: (i) => i.customId === "EMBED_ADD" && i.member.id === member.id && i.message.id === sentMsg.id,
      time: 20000,
    })
    .catch((ex) => {});

  if (!btnInteraction) return sentMsg.edit({ content: "> <a:r2_rice:868583626227478591> 已超時。", components: [] });

  await btnInteraction.showModal(
    new ModalBuilder({
      customId: "EMBED_MODAL",
      title: "花瓶幫你生成嵌入訊息la",
      components: [
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("title")
            .setLabel("嵌入標題")
            .setStyle(TextInputStyle.Short)
            .setRequired(false)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("author")
            .setLabel("嵌入作者")
            .setStyle(TextInputStyle.Short)
            .setRequired(false)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("description")
            .setLabel("嵌入說明")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(false)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("color")
            .setLabel("嵌入顏色")
            .setStyle(TextInputStyle.Short)
            .setRequired(false)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("footer")
            .setLabel("嵌入頁腳")
            .setStyle(TextInputStyle.Short)
            .setRequired(false)
        ),
      ],
    })
  );

  // receive modal input
  const modal = await btnInteraction
    .awaitModalSubmit({
      time: 1 * 60 * 1000,
      filter: (m) => m.customId === "EMBED_MODAL" && m.member.id === member.id && m.message.id === sentMsg.id,
    })
    .catch((ex) => {});

  if (!modal) return sentMsg.edit({ content: "> <a:r2_rice:868583626227478591> 已超時，故取消生成。", components: [] });

  modal.reply({ content: "> <a:r3_rice:868583679465758820> 嵌入訊息已發送。", ephemeral: true }).catch((ex) => {});

  const title = modal.fields.getTextInputValue("title");
  const author = modal.fields.getTextInputValue("author");
  const description = modal.fields.getTextInputValue("description");
  const footer = modal.fields.getTextInputValue("footer");
  const color = modal.fields.getTextInputValue("color");

  if (!title && !author && !description && !footer)
    return sentMsg.edit({ content: "> <a:r2_rice:868583626227478591> 不能發送空的嵌入訊息！", components: [] });

  const embed = new EmbedBuilder();
  if (title) embed.setTitle(title);
  if (author) embed.setAuthor({ name: author });
  if (description) embed.setDescription(description);
  if (footer) embed.setFooter({ text: footer });
  if ((color && isValidColor(color)) || (color && isHex(color))) embed.setColor(color);

  // add/remove field button
  const buttonRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("EMBED_FIELD_ADD").setLabel("添加字段").setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId("EMBED_FIELD_REM").setLabel("刪除字段").setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId("EMBED_FIELD_DONE").setLabel("設置完畢").setStyle(ButtonStyle.Primary)
  );

  await sentMsg.edit({
    content: "> <a:r3_rice:868583679465758820> 可選字段的新增，或者就這樣完成也可以。",
    embeds: [embed],
    components: [buttonRow],
  });

  const collector = channel.createMessageComponentCollector({
    componentType: ComponentType.Button,
    filter: (i) => i.member.id === member.id,
    message: sentMsg,
    idle: 5 * 60 * 1000,
  });

  collector.on("collect", async (interaction) => {
    if (interaction.customId === "EMBED_FIELD_ADD") {
      await interaction.showModal(
        new ModalBuilder({
          customId: "EMBED_ADD_FIELD_MODAL",
          title: "添加字段",
          components: [
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId("name")
                .setLabel("字段名稱")
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
            ),
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId("value")
                .setLabel("字段說明")
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true)
            ),
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId("inline")
                .setLabel("是否併排？（是/否）")
                .setStyle(TextInputStyle.Short)
                .setValue("是")
                .setRequired(true)
            ),
          ],
        })
      );

      // receive modal input
      const modal = await interaction
        .awaitModalSubmit({
          time: 5 * 60 * 1000,
          filter: (m) => m.customId === "EMBED_ADD_FIELD_MODAL" && m.member.id === member.id,
        })
        .catch((ex) => {});

      if (!modal) return sentMsg.edit({ components: [] });

      modal.reply({ content: "> <a:r3_rice:868583679465758820> 已成功添加字段。", ephemeral: true }).catch((ex) => {});

      const name = modal.fields.getTextInputValue("name");
      const value = modal.fields.getTextInputValue("value");
      let inline = modal.fields.getTextInputValue("inline").toLowerCase();

      if (inline === "是") inline = true;
      else if (inline === "否") inline = false;
      else inline = true; // default to true

      const fields = embed.data.fields || [];
      fields.push({ name, value, inline });
      embed.setFields(fields);
    }

    // remove field
    else if (interaction.customId === "EMBED_FIELD_REM") {
      const fields = embed.data.fields;
      if (fields) {
        fields.pop();
        embed.setFields(fields);
        interaction.reply({ content: "> <a:r3_rice:868583679465758820> 已成功刪除字段。", ephemeral: true });
      } else {
        interaction.reply({ content: "> <a:r2_rice:868583626227478591> 沒有需要刪除的字段。", ephemeral: true });
      }
    }

    // done
    else if (interaction.customId === "EMBED_FIELD_DONE") {
      return collector.stop();
    }

    await sentMsg.edit({ embeds: [embed] });
  });

  collector.on("end", async (_collected, _reason) => {
    await sentMsg.edit({ content: "", components: [] });
  });
}
