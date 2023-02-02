const SnakeGame = require("snakecord");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "趣味貪吃蛇",
  description: "在 Discord 上玩貪吃蛇",
  cooldown: 300,
  category: "趣味類",
  botPermissions: ["SendMessages", "EmbedLinks", "AddReactions", "ReadMessageHistory", "ManageMessages"],
  command: {
    enabled: true,
  },
  slashCommand: {
    enabled: true,
  },

  async messageRun(message, args) {
    await message.safeReply("> <a:r3_rice:868583679465758820> 貪吃蛇");
    await startSnakeGame(message);
  },

  async interactionRun(interaction) {
    await interaction.followUp("> <a:r3_rice:868583679465758820> 貪吃蛇");
    await startSnakeGame(interaction);
  },
};

async function startSnakeGame(data) {
  const snakeGame = new SnakeGame({
    title: "吃紅色蘋果、不要撞到綠色自己、表情符號上下左右移動。",
    color: "BLUE",
    timestamp: true,
    gameOverTitle: "> <a:r2_rice:868583626227478591> 遊戲結束！",
  });

  await snakeGame.newGame(data);
}
