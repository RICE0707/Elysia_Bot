const { getSettings } = require("@schemas/Guild");
const { findSuggestion, deleteSuggestionDb } = require("@schemas/Suggestions");
const { SUGGESTIONS } = require("@root/config");
const {
  ActionRowBuilder,
  ButtonBuilder,
  ModalBuilder,
  TextInputBuilder,
  EmbedBuilder,
  ButtonStyle,
  TextInputStyle,
} = require("discord.js");
const { stripIndents } = require("common-tags");

/**
 * @param {import('discord.js').Message} message
 */
const getStats = (message) => {
  const upVotes = message.reactions.resolve(SUGGESTIONS.EMOJI.UP_VOTE).count - 1;
  const downVotes = message.reactions.resolve(SUGGESTIONS.EMOJI.DOWN_VOTE).count - 1;
  return [upVotes, downVotes];
};

/**
 * @param {number} upVotes
 * @param {number} downVotes
 */
const getVotesMessage = (upVotes, downVotes) => {
  const total = upVotes + downVotes;
  if (total === 0) {
    return stripIndents`
  > 贊成：無
  > 反對：無
  `;
  } else {
    return stripIndents`
  > 贊成：\` ${upVotes} \`票 - [\` ${Math.round((upVotes / (upVotes + downVotes)) * 100)}% \`]
  > 反對：\` ${downVotes} \`票 - [\` ${Math.round((downVotes / (upVotes + downVotes)) * 100)}% \`]
  `;
  }
};

const hasPerms = (member, settings) => {
  return (
    member.permissions.has("ManageGuild") ||
    member.roles.cache.find((r) => settings.suggestions.staff_roles.includes(r.id))
  );
};

/**
 * @param {import('discord.js').GuildMember} member
 * @param {import('discord.js').TextBasedChannel} channel
 * @param {string} messageId
 * @param {string} [reason]
 */
async function approveSuggestion(member, channel, messageId, reason) {
  const { guild } = member;
  const settings = await getSettings(guild);

  // validate permissions
  if (!hasPerms(member, settings)) return "> <a:r2_rice:868583626227478591> 你沒有\` 批准建議 \`的權限。";

  // validate if document exists
  const doc = await findSuggestion(guild.id, messageId);
  if (!doc) return "> <a:r2_rice:868583626227478591> 花瓶找不到建議訊息。";
  if (doc.status === "APPROVED") return "> <a:r3_rice:868583679465758820> 已批准建議。";

  /**
   * @type {import('discord.js').Message}
   */
  let message;
  try {
    message = await channel.messages.fetch({ message: messageId, force: true });
  } catch (err) {
    return "> <a:r2_rice:868583626227478591> 花瓶找不到建議訊息。";
  }

  let buttonsRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("SUGGEST_APPROVE")
      .setLabel("批准")
      .setStyle(ButtonStyle.Success)
      .setDisabled(true),
    new ButtonBuilder().setCustomId("SUGGEST_REJECT").setLabel("否決").setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId("SUGGEST_DELETE").setLabel("刪除").setStyle(ButtonStyle.Secondary)
  );

  const approvedEmbed = new EmbedBuilder()
    .setDescription(message.embeds[0].data.description)
    .setColor(SUGGESTIONS.APPROVED_EMBED)
    .setAuthor({ name: "已批准建議。", iconURL: 'https://cdn.discordapp.com/attachments/1067805752183488663/1068501885193039973/1015210055_61696d776b439.jpg', url: 'https://discord.gg/c4tKJME4hE' })
    .setFooter({ text: `來自花瓶星球的科技支援 v3.0 - ${member.user.tag}`, iconURL: member.displayAvatarURL() })
    .setTimestamp();

  const fields = [];

  // add stats if it doesn't exist
  const statsField = message.embeds[0].fields.find((field) => field.name === "**投票結果**");
  if (!statsField) {
    const [upVotes, downVotes] = getStats(message);
    doc.stats.upvotes = upVotes;
    doc.stats.downvotes = downVotes;
    fields.push({ name: "**投票結果**", value: getVotesMessage(upVotes, downVotes) });
  } else {
    fields.push(statsField);
  }

  // update reason
  if (reason) fields.push({ name: "**決策理由**", value: "> " + reason + " " });

  approvedEmbed.addFields(fields);

  try {
    doc.status = "APPROVED";
    doc.status_updates.push({ user_id: member.id, status: "APPROVED", reason, timestamp: new Date() });

    let approveChannel;
    if (settings.suggestions.approved_channel) {
      approveChannel = guild.channels.cache.get(settings.suggestions.approved_channel);
    }

    // suggestions-approve channel is not configured
    if (!approveChannel) {
      await message.edit({ embeds: [approvedEmbed], components: [buttonsRow] });
      await message.reactions.removeAll();
    }

    // suggestions-approve channel is configured
    else {
      const sent = await approveChannel.send({ embeds: [approvedEmbed], components: [buttonsRow] });
      doc.channel_id = approveChannel.id;
      doc.message_id = sent.id;
      await message.delete();
    }

    await doc.save();
    return "> <a:r3_rice:868583679465758820> 已批准建議。";
  } catch (ex) {
    guild.client.logger.error("approveSuggestion", ex);
    return "> <a:r2_rice:868583626227478591> 花瓶無法批准建議。";
  }
}

/**
 * @param {import('discord.js').GuildMember} member
 * @param {import('discord.js').TextBasedChannel} channel
 * @param {string} messageId
 * @param {string} [reason]
 */
async function rejectSuggestion(member, channel, messageId, reason) {
  const { guild } = member;
  const settings = await getSettings(guild);

  // validate permissions
  if (!hasPerms(member, settings)) return "> <a:r2_rice:868583626227478591> 你沒有\` 否決建議 \`的權限。";

  // validate if document exists
  const doc = await findSuggestion(guild.id, messageId);
  if (!doc) return "> <a:r2_rice:868583626227478591> 花瓶找不到建議訊息。";
  if (doc.is_rejected) return "<a:r3_rice:868583679465758820> 建議已否決。";

  let message;
  try {
    message = await channel.messages.fetch({ message: messageId });
  } catch (err) {
    return "> <a:r2_rice:868583626227478591> 花瓶找不到建議訊息。";
  }

  let buttonsRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("SUGGEST_APPROVE").setLabel("批准").setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId("SUGGEST_REJECT").setLabel("否決").setStyle(ButtonStyle.Danger).setDisabled(true),
    new ButtonBuilder().setCustomId("SUGGEST_DELETE").setLabel("刪除").setStyle(ButtonStyle.Secondary)
  );

  const rejectedEmbed = new EmbedBuilder()
    .setDescription(message.embeds[0].data.description)
    .setColor(SUGGESTIONS.DENIED_EMBED)
    .setAuthor({ name: "已否決建議", iconURL: 'https://cdn.discordapp.com/attachments/1067805752183488663/1068501885193039973/1015210055_61696d776b439.jpg', url: 'https://discord.gg/c4tKJME4hE' })
    .setFooter({ text: `來自花瓶星球的科技支援 v3.0 - ${member.user.tag}`, iconURL: member.displayAvatarURL() })
    .setTimestamp();

  const fields = [];

  // add stats if it doesn't exist
  const statsField = message.embeds[0].fields.find((field) => field.name === "**投票結果**");
  if (!statsField) {
    const [upVotes, downVotes] = getStats(message);
    doc.stats.upvotes = upVotes;
    doc.stats.downvotes = downVotes;
    fields.push({ name: "**投票結果**", value: getVotesMessage(upVotes, downVotes) });
  } else {
    fields.push(statsField);
  }

  // update reason
  if (reason) fields.push({ name: "**決策理由**", value: "> " + reason + " " });

  rejectedEmbed.addFields(fields);

  try {
    doc.status = "REJECTED";
    doc.status_updates.push({ user_id: member.id, status: "REJECTED", reason, timestamp: new Date() });

    let rejectChannel;
    if (settings.suggestions.rejected_channel) {
      rejectChannel = guild.channels.cache.get(settings.suggestions.rejected_channel);
    }

    // suggestions-reject channel is not configured
    if (!rejectChannel) {
      await message.edit({ embeds: [rejectedEmbed], components: [buttonsRow] });
      await message.reactions.removeAll();
    }

    // suggestions-reject channel is configured
    else {
      const sent = await rejectChannel.send({ embeds: [rejectedEmbed], components: [buttonsRow] });
      doc.channel_id = rejectChannel.id;
      doc.message_id = sent.id;
      await message.delete();
    }

    await doc.save();
    return "> <a:r3_rice:868583679465758820> 已否決建議。";
  } catch (ex) {
    guild.client.logger.error("rejectSuggestion", ex);
    return "> <a:r2_rice:868583626227478591> 花瓶無法否決建議。";
  }
}

/**
 * @param {import('discord.js').GuildMember} member
 * @param {import('discord.js').TextBasedChannel} channel
 * @param {string} messageId
 * @param {string} [reason]
 */
async function deleteSuggestion(member, channel, messageId, reason) {
  const { guild } = member;
  const settings = await getSettings(guild);

  // validate permissions
  if (!hasPerms(member, settings)) return "> <a:r2_rice:868583626227478591> 你沒有\` 刪除建議 \`的權限。";

  try {
    await channel.messages.delete(messageId);
    await deleteSuggestionDb(guild.id, messageId, member.id, reason);
    return "<a:r3_rice:868583679465758820> 建議已刪除。";
  } catch (ex) {
    guild.client.logger.error("deleteSuggestion", ex);
    return "> <a:r2_rice:868583626227478591> 花瓶刪不到建議訊息，請手動刪除。";
  }
}

/**
 * @param {import('discord.js').ButtonInteraction} interaction
 */
async function handleApproveBtn(interaction) {
  await interaction.showModal(
    new ModalBuilder({
      title: "批准建議",
      customId: "SUGGEST_APPROVE_MODAL",
      components: [
        new ActionRowBuilder().addComponents([
          new TextInputBuilder()
            .setCustomId("reason")
            .setLabel("原因")
            .setStyle(TextInputStyle.Paragraph)
            .setMinLength(4),
        ]),
      ],
    })
  );
}

/**
 * @param {import('discord.js').ModalSubmitInteraction} modal
 */
async function handleApproveModal(modal) {
  await modal.deferReply({ ephemeral: true });
  const reason = modal.fields.getTextInputValue("reason");
  const response = await approveSuggestion(modal.member, modal.channel, modal.message.id, reason);
  await modal.followUp(response);
}

/**
 * @param {import('discord.js').ButtonInteraction} interaction
 */
async function handleRejectBtn(interaction) {
  await interaction.showModal(
    new ModalBuilder({
      title: "否決建議",
      customId: "SUGGEST_REJECT_MODAL",
      components: [
        new ActionRowBuilder().addComponents([
          new TextInputBuilder()
            .setCustomId("reason")
            .setLabel("原因")
            .setStyle(TextInputStyle.Paragraph)
            .setMinLength(4),
        ]),
      ],
    })
  );
}

/**
 * @param {import('discord.js').ModalSubmitInteraction} modal
 */
async function handleRejectModal(modal) {
  await modal.deferReply({ ephemeral: true });
  const reason = modal.fields.getTextInputValue("reason");
  const response = await rejectSuggestion(modal.member, modal.channel, modal.message.id, reason);
  await modal.followUp(response);
}

/**
 * @param {import('discord.js').ButtonInteraction} interaction
 */
async function handleDeleteBtn(interaction) {
  await interaction.showModal(
    new ModalBuilder({
      title: "刪除建議",
      customId: "SUGGEST_DELETE_MODAL",
      components: [
        new ActionRowBuilder().addComponents([
          new TextInputBuilder()
            .setCustomId("reason")
            .setLabel("原因")
            .setStyle(TextInputStyle.Paragraph)
            .setMinLength(4),
        ]),
      ],
    })
  );
}

/**
 * @param {import('discord.js').ModalSubmitInteraction} modal
 */
async function handleDeleteModal(modal) {
  await modal.deferReply({ ephemeral: true });
  const reason = modal.fields.getTextInputValue("reason");
  const response = await deleteSuggestion(modal.member, modal.channel, modal.message.id, reason);
  await modal.followUp({ content: response, ephemeral: true });
}

module.exports = {
  handleApproveBtn,
  handleApproveModal,
  handleRejectBtn,
  handleRejectModal,
  handleDeleteBtn,
  handleDeleteModal,
  approveSuggestion,
  rejectSuggestion,
  deleteSuggestion,
};
