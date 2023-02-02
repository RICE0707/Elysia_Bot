const { moveTarget } = require("@helpers/ModUtils");

module.exports = async ({ member }, target, reason, channel) => {
  const response = await moveTarget(member, target, reason, channel);
  if (typeof response === "boolean") {
    return `> <a:r3_rice:868583679465758820> \` ${target.user.tag} \`已被轉移至 ${channel} 中。`;
  }
  if (response === "MEMBER_PERM") {
    return `> <a:r2_rice:868583626227478591> 你沒有權限讓\` ${target.user.tag} \`斷線。`;
  }
  if (response === "BOT_PERM") {
    return `> <a:r2_rice:868583626227478591> 花瓶沒有權限讓\` ${target.user.tag} \`斷線。`;
  }
  if (response === "NO_VOICE") {
    return `> <a:r2_rice:868583626227478591> \` ${target.user.tag} \`不在語音頻道中。`;
  }
  if (response === "TARGET_PERM") {
    return `> <a:r2_rice:868583626227478591> \` ${target.user.tag} \`沒有權限進入 ${channel} 。`;
  }
  if (response === "ALREADY_IN_CHANNEL") {
    return `> <a:r2_rice:868583626227478591> \` ${target.user.tag} \`已在 ${channel} 中。`;
  }
  return `> <a:r2_rice:868583626227478591> 花瓶無法將\` ${target.user.tag} \`移動到 ${channel} 中。`;
};
