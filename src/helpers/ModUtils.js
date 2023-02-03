const { Collection, EmbedBuilder, GuildMember } = require("discord.js");
const { MODERATION } = require("@root/config");

// Utils
const { containsLink } = require("@helpers/Utils");
const { error } = require("@helpers/Logger");

// Schemas
const { getSettings } = require("@schemas/Guild");
const { getMember } = require("@schemas/Member");
const { addModLogToDb } = require("@schemas/ModLog");

const DEFAULT_TIMEOUT_DAYS = 7;

const memberInteract = (issuer, target) => {
  const { guild } = issuer;
  if (guild.ownerId === issuer.id) return true;
  if (guild.ownerId === target.id) return false;
  return issuer.roles.highest.position > target.roles.highest.position;
};

/**
 * Send logs to the configured channel and stores in the database
 * @param {import('discord.js').GuildMember} issuer
 * @param {import('discord.js').GuildMember|import('discord.js').User} target
 * @param {string} reason
 * @param {string} type
 * @param {Object} data
 */
const logModeration = async (issuer, target, reason, type, data = {}) => {
  if (!type) return;
  const { guild } = issuer;
  const settings = await getSettings(guild);

  let logChannel;
  if (settings.modlog_channel) logChannel = guild.channels.cache.get(settings.modlog_channel);

  const embed = new EmbedBuilder().setFooter({
    text: `來自花瓶星球的科技支援 v3.0 • ${issuer.displayName} • ${issuer.id}`,
    iconURL: issuer.displayAvatarURL(),
  });

  const fields = [];
  switch (type.toUpperCase()) {
    case "清除訊息":
      embed.setAuthor({ name: `花瓶的制裁 - ${type}`, iconURL: 'https://cdn.discordapp.com/attachments/1067011834642698280/1068834656948068445/3.png', url: 'https://discord.gg/c4tKJME4hE' });
      fields.push(
        { name: "清除類型", value: `\` ${data.purgeType} \``, inline: true },
        { name: "瓶清除了", value: `\` ${data.deletedCount.toString()} \`則訊息`, inline: true },
        { name: "清除頻道", value: `\` ${data.channel.name}（${data.channel.id}）`, inline: false }
      );
      break;

    case "禁言":
      embed.setColor(MODERATION.EMBED_COLORS.TIMEOUT);
      break;

    case "解除禁言":
      embed.setColor(MODERATION.EMBED_COLORS.UNTIMEOUT);
      break;

    case "踢出":
      embed.setColor(MODERATION.EMBED_COLORS.KICK);
      break;

    case "軟封禁":
      embed.setColor(MODERATION.EMBED_COLORS.SOFTBAN);
      break;

    case "封禁":
      embed.setColor(MODERATION.EMBED_COLORS.BAN);
      break;

    case "解除封禁":
      embed.setColor(MODERATION.EMBED_COLORS.UNBAN);
      break;

    case "禁音":
      embed.setColor(MODERATION.EMBED_COLORS.VMUTE);
      break;

    case "解除禁音":
      embed.setColor(MODERATION.EMBED_COLORS.VUNMUTE);
      break;

    case "拒聽":
      embed.setColor(MODERATION.EMBED_COLORS.DEAFEN);
      break;

    case "解除拒聽":
      embed.setColor(MODERATION.EMBED_COLORS.UNDEAFEN);
      break;

    case "踢出語音":
      embed.setColor(MODERATION.EMBED_COLORS.DISCONNECT);
      break;

    case "移動":
      embed.setColor(MODERATION.EMBED_COLORS.MOVE);
      break;
  }

  if (type.toUpperCase() !== "清除訊息") {
    embed.setAuthor({ name: `花瓶的制裁 - ${type}`, iconURL: 'https://cdn.discordapp.com/attachments/1067805752183488663/1068501885193039973/1015210055_61696d776b439.jpg', url: 'https://discord.gg/c4tKJME4hE' }).setThumbnail(target.displayAvatarURL());

    if (target instanceof GuildMember) {
      fields.push({ name: "被處分者", value: `> \` ${target.displayName}（${target.id}） \``, inline: false });
    } else {
      fields.push({ name: "使用者", value: `> \` ${target.tag}（${target.id}） \``, inline: false });
    }

    fields.push({ name: "處分原因", value: `> \` ${reason || "無提供原因。"} \``, inline: false });

    if (type.toUpperCase() === "禁言") {
      fields.push({
        name: "禁言時長",
        value: `<t:${Math.round(target.communicationDisabledUntilTimestamp / 1000)}:R>`,
        inline: true,
      });
    }
    if (type.toUpperCase() === "移動") {
      fields.push({ name: "移動至", value: data.channel.name, inline: true });
    }
  }

  embed.setFields(fields);
  await addModLogToDb(issuer, target, reason, type.toUpperCase());
  if (logChannel) logChannel.safeSend({ embeds: [embed] });
};

module.exports = class ModUtils {
  /**
   * @param {import('discord.js').GuildMember} issuer
   * @param {import('discord.js').GuildMember} target
   */
  static canModerate(issuer, target) {
    return memberInteract(issuer, target);
  }

  /**
   * @param {import('discord.js').GuildMember} issuer
   * @param {import('discord.js').GuildMember} target
   * @param {string} reason
   * @param {"禁言"|"踢出"|"軟封禁"|"封禁"} action
   */
  static async addModAction(issuer, target, reason, action) {
    switch (action) {
      case "禁言":
        return ModUtils.timeoutTarget(issuer, target, DEFAULT_TIMEOUT_DAYS * 24 * 60, reason);

      case "踢出":
        return ModUtils.kickTarget(issuer, target, reason);

      case "軟封禁":
        return ModUtils.softbanTarget(issuer, target, reason);

      case "封禁":
        return ModUtils.banTarget(issuer, target, reason);
    }
  }
  /**
   * Delete the specified number of messages matching the type
   * @param {import('discord.js').GuildMember} issuer
   * @param {import('discord.js').BaseGuildTextChannel} channel
   * @param {"檔案"|"機器人"|"連結"|"金鑰"|"使用者"|"全部"} type
   * @param {number} amount
   * @param {any} argument
   */
  static async purgeMessages(issuer, channel, type, amount, argument) {
    if (!channel.permissionsFor(issuer).has(["ManageMessages", "ReadMessageHistory"])) {
      return "MEMBER_PERM";
    }

    if (!channel.permissionsFor(issuer.guild.members.me).has(["ManageMessages", "ReadMessageHistory"])) {
      return "BOT_PERM";
    }

    const toDelete = new Collection();

    try {
      const messages = await channel.messages.fetch({ limit: amount, cache: false, force: true });

      for (const message of messages.values()) {
        if (toDelete.size >= amount) break;
        if (!message.deletable) continue;
        if (message.createdTimestamp < Date.now() - 1209600000) continue; // skip messages older than 14 days

        if (type === "全部") {
          toDelete.set(message.id, message);
        } else if (type === "檔案") {
          if (message.attachments.size > 0) {
            toDelete.set(message.id, message);
          }
        } else if (type === "機器人") {
          if (message.author.bot) {
            toDelete.set(message.id, message);
          }
        } else if (type === "連結") {
          if (containsLink(message.content)) {
            toDelete.set(message.id, message);
          }
        } else if (type === "金鑰") {
          if (message.content.includes(argument)) {
            toDelete.set(message.id, message);
          }
        } else if (type === "使用者") {
          if (message.author.id === argument) {
            toDelete.set(message.id, message);
          }
        }
      }

      if (toDelete.size === 0) return "NO_MESSAGES";
      if (toDelete.size === 1 && toDelete.first().author.id === issuer.id) {
        await toDelete.first().delete();
        return "NO_MESSAGES";
      }

      const deletedMessages = await channel.bulkDelete(toDelete, true);
      await logModeration(issuer, "", "", "清除訊息", {
        purgeType: type,
        channel: channel,
        deletedCount: deletedMessages.size,
      });

      return deletedMessages.size;
    } catch (ex) {
      error("purgeMessages", ex);
      return "ERROR";
    }
  }

  /**
   * warns the target and logs to the database, channel
   * @param {import('discord.js').GuildMember} issuer
   * @param {import('discord.js').GuildMember} target
   * @param {string} reason
   */
  static async warnTarget(issuer, target, reason) {
    if (!memberInteract(issuer, target)) return "MEMBER_PERM";
    if (!memberInteract(issuer.guild.members.me, target)) return "BOT_PERM";

    try {
      logModeration(issuer, target, reason, "警告");
      const memberDb = await getMember(issuer.guild.id, target.id);
      memberDb.warnings += 1;
      const settings = await getSettings(issuer.guild);

      // check if max warnings are reached
      if (memberDb.warnings >= settings.max_warn.limit) {
        await ModUtils.addModAction(issuer.guild.members.me, target, "已達到最大警告數", settings.max_warn.action); // moderate
        memberDb.warnings = 0; // reset warnings
      }

      await memberDb.save();
      return true;
    } catch (ex) {
      error("warnTarget", ex);
      return "ERROR";
    }
  }

  /**
   * Timeouts(aka mutes) the target and logs to the database, channel
   * @param {import('discord.js').GuildMember} issuer
   * @param {import('discord.js').GuildMember} target
   * @param {number} ms
   * @param {string} reason
   */
  static async timeoutTarget(issuer, target, ms, reason) {
    if (!memberInteract(issuer, target)) return "MEMBER_PERM";
    if (!memberInteract(issuer.guild.members.me, target)) return "BOT_PERM";
    if (target.communicationDisabledUntilTimestamp - Date.now() > 0) return "ALREADY_TIMEOUT";

    try {
      await target.timeout(ms, reason);
      logModeration(issuer, target, reason, "禁言");
      return true;
    } catch (ex) {
      error("timeoutTarget", ex);
      return "ERROR";
    }
  }

  /**
   * UnTimeouts(aka mutes) the target and logs to the database, channel
   * @param {import('discord.js').GuildMember} issuer
   * @param {import('discord.js').GuildMember} target
   * @param {string} reason
   */
  static async unTimeoutTarget(issuer, target, reason) {
    if (!memberInteract(issuer, target)) return "MEMBER_PERM";
    if (!memberInteract(issuer.guild.members.me, target)) return "BOT_PERM";
    if (target.communicationDisabledUntilTimestamp - Date.now() < 0) return "NO_TIMEOUT";

    try {
      await target.timeout(null, reason);
      logModeration(issuer, target, reason, "解除禁言");
      return true;
    } catch (ex) {
      error("unTimeoutTarget", ex);
      return "ERROR";
    }
  }

  /**
   * kicks the target and logs to the database, channel
   * @param {import('discord.js').GuildMember} issuer
   * @param {import('discord.js').GuildMember} target
   * @param {string} reason
   */
  static async kickTarget(issuer, target, reason) {
    if (!memberInteract(issuer, target)) return "MEMBER_PERM";
    if (!memberInteract(issuer.guild.members.me, target)) return "BOT_PERM";

    try {
      await target.kick(reason);
      logModeration(issuer, target, reason, "踢出");
      return true;
    } catch (ex) {
      error("kickTarget", ex);
      return "ERROR";
    }
  }

  /**
   * Softbans the target and logs to the database, channel
   * @param {import('discord.js').GuildMember} issuer
   * @param {import('discord.js').GuildMember} target
   * @param {string} reason
   */
  static async softbanTarget(issuer, target, reason) {
    if (!memberInteract(issuer, target)) return "MEMBER_PERM";
    if (!memberInteract(issuer.guild.members.me, target)) return "BOT_PERM";

    try {
      await target.ban({ deleteMessageDays: 7, reason });
      await issuer.guild.members.unban(target.user);
      logModeration(issuer, target, reason, "軟封禁");
      return true;
    } catch (ex) {
      error("softbanTarget", ex);
      return "ERROR";
    }
  }

  /**
   * Bans the target and logs to the database, channel
   * @param {import('discord.js').GuildMember} issuer
   * @param {import('discord.js').User} target
   * @param {string} reason
   */
  static async banTarget(issuer, target, reason) {
    const targetMem = await issuer.guild.members.fetch(target.id).catch(() => {});

    if (targetMem && !memberInteract(issuer, targetMem)) return "MEMBER_PERM";
    if (targetMem && !memberInteract(issuer.guild.members.me, targetMem)) return "BOT_PERM";

    try {
      await issuer.guild.bans.create(target.id, { days: 0, reason });
      logModeration(issuer, target, reason, "封禁");
      return true;
    } catch (ex) {
      error(`banTarget`, ex);
      return "ERROR";
    }
  }

  /**
   * Bans the target and logs to the database, channel
   * @param {import('discord.js').GuildMember} issuer
   * @param {import('discord.js').User} target
   * @param {string} reason
   */
  static async unBanTarget(issuer, target, reason) {
    try {
      await issuer.guild.bans.remove(target, reason);
      logModeration(issuer, target, reason, "解除封禁");
      return true;
    } catch (ex) {
      error(`unBanTarget`, ex);
      return "ERROR";
    }
  }

  /**
   * Voice mutes the target and logs to the database, channel
   * @param {import('discord.js').GuildMember} issuer
   * @param {import('discord.js').GuildMember} target
   * @param {string} reason
   */
  static async vMuteTarget(issuer, target, reason) {
    if (!memberInteract(issuer, target)) return "MEMBER_PERM";
    if (!memberInteract(issuer.guild.members.me, target)) return "BOT_PERM";

    if (!target.voice.channel) return "NO_VOICE";
    if (target.voice.mute) return "ALREADY_MUTED";

    try {
      await target.voice.setMute(true, reason);
      logModeration(issuer, target, reason, "禁音");
      return true;
    } catch (ex) {
      error(`vMuteTarget`, ex);
      return "ERROR";
    }
  }

  /**
   * Voice unmutes the target and logs to the database, channel
   * @param {import('discord.js').GuildMember} issuer
   * @param {import('discord.js').GuildMember} target
   * @param {string} reason
   */
  static async vUnmuteTarget(issuer, target, reason) {
    if (!memberInteract(issuer, target)) return "MEMBER_PERM";
    if (!memberInteract(issuer.guild.members.me, target)) return "BOT_PERM";

    if (!target.voice.channel) return "NO_VOICE";
    if (!target.voice.mute) return "NOT_MUTED";

    try {
      await target.voice.setMute(false, reason);
      logModeration(issuer, target, reason, "解除禁音");
      return true;
    } catch (ex) {
      error(`vUnmuteTarget`, ex);
      return "ERROR";
    }
  }

  /**
   * Deafens the target and logs to the database, channel
   * @param {import('discord.js').GuildMember} issuer
   * @param {import('discord.js').GuildMember} target
   * @param {string} reason
   */
  static async deafenTarget(issuer, target, reason) {
    if (!memberInteract(issuer, target)) return "MEMBER_PERM";
    if (!memberInteract(issuer.guild.members.me, target)) return "BOT_PERM";

    if (!target.voice.channel) return "NO_VOICE";
    if (target.voice.deaf) return "ALREADY_DEAFENED";

    try {
      await target.voice.setDeaf(true, reason);
      logModeration(issuer, target, reason, "拒聽");
      return true;
    } catch (ex) {
      error(`deafenTarget`, ex);
      return `> <a:r2_rice:868583626227478591> 花瓶無法使\` ${target.user.tag} \`被拒聽。`;
    }
  }

  /**
   * UnDeafens the target and logs to the database, channel
   * @param {import('discord.js').GuildMember} issuer
   * @param {import('discord.js').GuildMember} target
   * @param {string} reason
   */
  static async unDeafenTarget(issuer, target, reason) {
    if (!memberInteract(issuer, target)) return "MEMBER_PERM";
    if (!memberInteract(issuer.guild.members.me, target)) return "BOT_PERM";

    if (!target.voice.channel) return "NO_VOICE";
    if (!target.voice.deaf) return "NOT_DEAFENED";

    try {
      await target.voice.setDeaf(false, reason);
      logModeration(issuer, target, reason, "解除拒聽");
      return true;
    } catch (ex) {
      error(`unDeafenTarget`, ex);
      return "ERROR";
    }
  }

  /**
   * Disconnects the target from voice channel and logs to the database, channel
   * @param {import('discord.js').GuildMember} issuer
   * @param {import('discord.js').GuildMember} target
   * @param {string} reason
   */
  static async disconnectTarget(issuer, target, reason) {
    if (!memberInteract(issuer, target)) return "MEMBER_PERM";
    if (!memberInteract(issuer.guild.members.me, target)) return "BOT_PERM";

    if (!target.voice.channel) return "NO_VOICE";

    try {
      await target.voice.disconnect(reason);
      logModeration(issuer, target, reason, "踢出語音");
      return true;
    } catch (ex) {
      error(`unDeafenTarget`, ex);
      return "ERROR";
    }
  }

  /**
   * Moves the target to another voice channel and logs to the database, channel
   * @param {import('discord.js').GuildMember} issuer
   * @param {import('discord.js').GuildMember} target
   * @param {string} reason
   * @param {import('discord.js').VoiceChannel|import('discord.js').StageChannel} channel
   */
  static async moveTarget(issuer, target, reason, channel) {
    if (!memberInteract(issuer, target)) return "MEMBER_PERM";
    if (!memberInteract(issuer.guild.members.me, target)) return "BOT_PERM";

    if (!target.voice?.channel) return "NO_VOICE";
    if (target.voice.channelId === channel.id) return "ALREADY_IN_CHANNEL";

    if (!channel.permissionsFor(target).has(["ViewChannel", "Connect"])) return "TARGET_PERM";

    try {
      await target.voice.setChannel(channel, reason);
      logModeration(issuer, target, reason, "移動", { channel });
      return true;
    } catch (ex) {
      error(`moveTarget`, ex);
      return "ERROR";
    }
  }
};
