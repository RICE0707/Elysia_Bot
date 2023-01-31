const { vUnmuteTarget } = require("@helpers/ModUtils");

module.exports = async ({ member }, target, reason) => {
  const response = await vUnmuteTarget(member, target, reason);
  if (typeof response === "boolean") {
    return `> <a:r3_rice:868583679465758820> 已解除\` ${target.user.tag} \`的禁音。`;
  }
  if (response === "MEMBER_PERM") {
    return `> <a:r2_rice:868583626227478591> 你沒有權限解除\` ${target.user.tag} \`的禁音。`;
  }
  if (response === "BOT_PERM") {
    return `> <a:r2_rice:868583626227478591> 花瓶沒有權限解除\` ${target.user.tag} \`的禁音。`;
  }
  if (response === "NO_VOICE") {
    return `> <a:r2_rice:868583626227478591> \` ${target.user.tag} \`不在語音頻道中。`;
  }
  if (response === "NOT_MUTED") {
    return `> <a:r2_rice:868583626227478591> ${target.user.tag} 沒有被禁音。`;
  }
  return `> <a:r2_rice:868583626227478591> 無法解除禁音\` ${target.user.tag} \`。`;
};
