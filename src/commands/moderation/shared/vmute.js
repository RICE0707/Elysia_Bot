const { vMuteTarget } = require("@helpers/ModUtils");

module.exports = async ({ member }, target, reason) => {
  const response = await vMuteTarget(member, target, reason);
  if (typeof response === "boolean") {
    return `> <a:r3_rice:868583679465758820> 已讓\` ${target.user.tag} \`被禁音。`;
  }
  if (response === "MEMBER_PERM") {
    return `> <a:r2_rice:868583626227478591> 你沒有權限禁音\` ${target.user.tag} \`。`;
  }
  if (response === "BOT_PERM") {
    return `> <a:r2_rice:868583626227478591> 花瓶沒有權限禁音\` ${target.user.tag} \`。`;
  }
  if (response === "NO_VOICE") {
    return `> <a:r2_rice:868583626227478591> \` ${target.user.tag} \`不在語音頻道中。`;
  }
  if (response === "ALREADY_MUTED") {
    return `> <a:r2_rice:868583626227478591> \` ${target.user.tag} \`已被禁音。`;
  }
  return `> <a:r2_rice:868583626227478591> 無法禁音\` ${target.user.tag} \`。`;
};
