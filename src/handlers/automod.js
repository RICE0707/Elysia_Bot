const { EmbedBuilder } = require("discord.js");
const { containsLink, containsDiscordInvite } = require("@helpers/Utils");
const { getMember } = require("@schemas/Member");
const { addModAction } = require("@helpers/ModUtils");
const { AUTOMOD } = require("@root/config");
const { addAutoModLogToDb } = require("@schemas/AutomodLogs");

const antispamCache = new Map();
const MESSAGE_SPAM_THRESHOLD = 3000;

// Cleanup the cache
setInterval(() => {
  antispamCache.forEach((value, key) => {
    if (Date.now() - value.timestamp > MESSAGE_SPAM_THRESHOLD) {
      antispamCache.delete(key);
    }
  });
}, 10 * 60 * 1000);

/**
 * Check if the message needs to be moderated and has required permissions
 * @param {import('discord.js').Message} message
 */
const shouldModerate = (message) => {
  const { member, guild, channel } = message;

  // Ignore if bot cannot delete channel messages
  if (!channel.permissionsFor(guild.members.me)?.has("ManageMessages")) return false;

  // Ignore Possible Guild Moderators
  if (member.permissions.has(["KickMembers", "BanMembers", "ManageGuild"])) return false;

  // Ignore Possible Channel Moderators
  if (channel.permissionsFor(message.member).has("ManageMessages")) return false;
  return true;
};

/**
 * Perform moderation on the message
 * @param {import('discord.js').Message} message
 * @param {object} settings
 */
async function performAutomod(message, settings) {
  const { automod } = settings;

  if (automod.wh_channels.includes(message.channelId)) return;
  if (!automod.debug && !shouldModerate(message)) return;

  const { channel, member, guild, content, author, mentions } = message;
  const logChannel = settings.modlog_channel ? channel.guild.channels.cache.get(settings.modlog_channel) : null;

  let shouldDelete = false;
  let strikesTotal = 0;

  const fields = [];

  // Max mentions
  if (mentions.members.size > automod.max_mentions) {
    fields.push({ name: "處分原因", value: ` 標註使用者 （共${mentions.members.size}次）（上限${automod.max_mentions}次）`, inline: true });
    // strikesTotal += mentions.members.size - automod.max_mentions;
    strikesTotal += 1;
  }

  // Maxrole mentions
  if (mentions.roles.size > automod.max_role_mentions) {
    fields.push({ name: "處分原因", value: `標註身份組 （共${mentions.roles.size}次）（上限${automod.max_role_mentions}次）`, inline: true });
    // strikesTotal += mentions.roles.size - automod.max_role_mentions;
    strikesTotal += 1;
  }

  if (automod.anti_massmention > 0) {
    // check everyone mention
    if (mentions.everyone) {
      fields.push({ name: "處分原因", value: "標註everyone", inline: true });
      strikesTotal += 1;
    }

    // check user/role mentions
    if (mentions.users.size + mentions.roles.size > automod.anti_massmention) {
      fields.push({
        name: "處分原因",
        value: `標註次數超過限制（共${mentions.users.size + mentions.roles.size}次）（上限${automod.anti_massmention}次）`,
        inline: true,
      });
      // strikesTotal += mentions.users.size + mentions.roles.size - automod.anti_massmention;
      strikesTotal += 1;
    }
  }

  // Max Lines
  if (automod.max_lines > 0) {
    const count = content.split("\n").length;
    if (count > automod.max_lines) {
      fields.push({ name: "處分原因", value: `行數過多（共${count}行）（上限${automod.max_lines}行）`, inline: true });
      shouldDelete = true;
      // strikesTotal += Math.ceil((count - automod.max_lines) / automod.max_lines);
      strikesTotal += 1;
    }
  }

  // Anti Attachments
  if (automod.anti_attachments) {
    if (message.attachments.size > 0) {
      fields.push({ name: "處分原因", value: "發送檔案", inline: true });
      shouldDelete = true;
      strikesTotal += 1;
    }
  }

  // Anti links
  if (automod.anti_links) {
    if (containsLink(content)) {
      fields.push({ name: "處分原因", value: "發送連結", inline: true });
      shouldDelete = true;
      strikesTotal += 1;
    }
  }

  // Anti Spam
  if (!automod.anti_links && automod.anti_spam) {
    if (containsLink(content)) {
      const key = author.id + "|" + message.guildId;
      if (antispamCache.has(key)) {
        let antispamInfo = antispamCache.get(key);
        if (
          antispamInfo.channelId !== message.channelId &&
          antispamInfo.content === content &&
          Date.now() - antispamInfo.timestamp < MESSAGE_SPAM_THRESHOLD
        ) {
          fields.push({ name: "處分原因", value: "刷頻", inline: true });
          shouldDelete = true;
          strikesTotal += 1;
        }
      } else {
        let antispamInfo = {
          channelId: message.channelId,
          content,
          timestamp: Date.now(),
        };
        antispamCache.set(key, antispamInfo);
      }
    }
  }

  // Anti Invites
  if (!automod.anti_links && automod.anti_invites) {
    if (containsDiscordInvite(content)) {
      fields.push({ name: "處分原因", value: "Discord 邀請", inline: true });
      shouldDelete = true;
      strikesTotal += 1;
    }
  }

  // delete message if deletable
  if (shouldDelete && message.deletable) {
    message
      .delete()
      .then(() => channel.safeSend("> <a:r3_rice:868583679465758820> 你已違規，此訊息已被刪除。", 5))
      .catch(() => {});
  }

  if (strikesTotal > 0) {
    // add strikes to member
    const memberDb = await getMember(guild.id, author.id);
    memberDb.strikes += strikesTotal;

    // log to db
    const reason = fields.map((field) => field.name + "：" + field.value).join("\n");
    addAutoModLogToDb(member, content, reason, strikesTotal).catch(() => {});

    // send automod log
    if (logChannel) {
      const logEmbed = new EmbedBuilder()
        .setAuthor({ name: "自動管理系統", iconURL: 'https://cdn.discordapp.com/attachments/1067805752183488663/1068501885193039973/1015210055_61696d776b439.jpg', url: 'https://github.com/RICE0707/Elysia_Bot' })
        .setThumbnail(author.displayAvatarURL())
        .setColor(AUTOMOD.LOG_EMBED)
        .addFields(fields)
        .setDescription(`**頻道：** ${channel.toString()}\n**內容：**\n${content}`)
        .setTimestamp()
        .setFooter({
          text: `來自花瓶星球的科技支援 v3.0 - ${author.tag} | ${author.id}`,
          iconURL: author.avatarURL(),
        });

      logChannel.safeSend({ embeds: [logEmbed] });
    }

    // DM strike details
    const strikeEmbed = new EmbedBuilder()
      .setColor(AUTOMOD.DM_EMBED)
      .setThumbnail(guild.iconURL())
      .setAuthor({ name: "自動管理系統", iconURL: 'https://cdn.discordapp.com/attachments/1067805752183488663/1068501885193039973/1015210055_61696d776b439.jpg', url: 'https://github.com/RICE0707/Elysia_Bot' })
      .addFields(fields)
      .setTimestamp()
      .setFooter({ text: '來自花瓶星球的科技支援 v3.0', iconURL: 'https://cdn.discordapp.com/attachments/1067805752183488663/1068501885193039973/1015210055_61696d776b439.jpg' })    
      .setDescription(
        `你收到了來自 ${strikesTotal} 的群組警告！\n\n` +
          `**群組：** ${guild.name}\n` +
          `**警告：** ${memberDb.strikes}次，達到${automod.strikes}次後將被自動處分。`
      );

    author.send({ embeds: [strikeEmbed] }).catch((ex) => {});

    // check if max strikes are received
    if (memberDb.strikes >= automod.strikes) {
      // Reset Strikes
      memberDb.strikes = 0;

      // Add Moderation Action
      await addModAction(guild.members.me, member, "自動管理系統: 收到的最大警告數", automod.action).catch(() => {});
    }

    await memberDb.save();
  }
}

module.exports = {
  performAutomod,
};
