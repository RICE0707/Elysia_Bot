const { disconnectTarget } = require("@helpers/ModUtils");

module.exports = async ({ member }, target, reason) => {
  const response = await disconnectTarget(member, target, reason);
  if (typeof response === "boolean") {
    return `> <a:r3_rice:868583679465758820> 已讓\` ${target.user.tag} \`從語音頻道中斷縣。`;
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
  return `> <a:r2_rice:868583626227478591> 無法讓\` ${target.user.tag} \`斷線。`;
};
