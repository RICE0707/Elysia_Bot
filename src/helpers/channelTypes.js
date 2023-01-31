const { ChannelType } = require("discord.js");

/**
 * @param {number} type
 */
module.exports = (type) => {
  switch (type) {
    case ChannelType.GuildText:
      return "文字頻道";
    case ChannelType.GuildVoice:
      return "語音頻道";
    case ChannelType.GuildCategory:
      return "類別";
    case ChannelType.GuildAnnouncement:
      return "公告頻道";
    case ChannelType.AnnouncementThread:
      return "公告討論串";
    case ChannelType.PublicThread:
      return "公開討論串";
    case ChannelType.PrivateThread:
      return "私人討論串";
    case ChannelType.GuildStageVoice:
      return "舞台頻道";
    case ChannelType.GuildDirectory:
      return "目錄";
    case ChannelType.GuildForum:
      return "論壇頻道";
    default:
      return "未知類型";
  }
};
