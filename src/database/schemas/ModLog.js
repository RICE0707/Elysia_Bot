const mongoose = require("mongoose");

const reqString = {
  type: String,
  required: true,
};

const Schema = new mongoose.Schema(
  {
    guild_id: reqString,
    member_id: String,
    reason: String,
    admin: {
      id: reqString,
      tag: reqString,
    },
    type: {
      type: String,
      required: true,
      enum: [
        "清除訊息",
        "警告",
        "禁言",
        "解除禁言",
        "踢出",
        "軟封禁",
        "封禁",
        "解除封禁",
        "禁音",
        "解除禁音",
        "拒聽",
        "解除拒聽",
        "踢出語音",
        "移動",
      ],
    },
  },
  {
    versionKey: false,
    autoIndex: false,
    timestamps: {
      createdAt: "created_at",
      updatedAt: false,
    },
  }
);

const Model = mongoose.model("mod-logs", Schema);

module.exports = {
  model: Model,

  addModLogToDb: async (admin, target, reason, type) =>
    await new Model({
      guild_id: admin.guild.id,
      member_id: target.id,
      reason,
      admin: {
        id: admin.id,
        tag: admin.user.tag,
      },
      type,
    }).save(),

  getWarningLogs: async (guildId, targetId) =>
    Model.find({
      guild_id: guildId,
      member_id: targetId,
      type: "警告",
    }).lean(),

  clearWarningLogs: async (guildId, targetId) =>
    Model.deleteMany({
      guild_id: guildId,
      member_id: targetId,
      type: "警告",
    }),
};
