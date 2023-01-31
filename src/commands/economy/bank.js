const { ApplicationCommandOptionType } = require("discord.js");
const balance = require("./sub/balance");
const deposit = require("./sub/deposit");
const transfer = require("./sub/transfer");
const withdraw = require("./sub/withdraw");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "經濟銀行",
  description: "銀行相關功能（非現實貨幣）",
  category: "ECONOMY",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    minArgsCount: 1,
    subcommands: [
      {
        trigger: "餘額",
        description: "查看餘額（非現實貨幣）",
      },
      {
        trigger: "存款 <數量>",
        description: "將錢存入銀行（非現實貨幣）",
      },
      {
        trigger: "提取 <數量>",
        description: "從銀行提款（非現實貨幣）",
      },
      {
        trigger: "轉帳 <使用者> <數量>",
        description: "將錢轉帳給其他使用者（非現實貨幣）",
      },
    ],
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "餘額",
        description: "查看餘額（非現實貨幣）",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "使用者",
            description: "輸入使用者",
            type: ApplicationCommandOptionType.User,
            required: false,
          },
        ],
      },
      {
        name: "存款",
        description: "將錢存入銀行（非現實貨幣）",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "金額",
            description: "輸入數字",
            type: ApplicationCommandOptionType.Integer,
            required: true,
          },
        ],
      },
      {
        name: "提款",
        description: "從銀行提款（非現實貨幣）",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "金額",
            description: "輸入數字（非現實貨幣）",
            type: ApplicationCommandOptionType.Integer,
            required: true,
          },
        ],
      },
      {
        name: "轉帳",
        description: "將錢轉帳給其他使用者（非現實貨幣）",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "使用者",
            description: "輸入使用者",
            type: ApplicationCommandOptionType.User,
            required: true,
          },
          {
            name: "金額",
            description: "輸入數字（非現實貨幣）",
            type: ApplicationCommandOptionType.Integer,
            required: true,
          },
        ],
      },
    ],
  },

  async messageRun(message, args) {
    const sub = args[0];
    let response;

    if (sub === "餘額") {
      const resolved = (await message.guild.resolveMember(args[1])) || message.member;
      response = await balance(resolved.user);
    }

    //
    else if (sub === "存款") {
      const coins = args.length && parseInt(args[1]);
      if (isNaN(coins)) return message.safeReply("> <a:r2_rice:868583626227478591> 請提供正確的金額（非現實貨幣）。");
      response = await deposit(message.author, coins);
    }

    //
    else if (sub === "提款") {
      const coins = args.length && parseInt(args[1]);
      if (isNaN(coins)) return message.safeReply("> <a:r2_rice:868583626227478591> 請提供正確的金額（非現實貨幣）。");
      response = await withdraw(message.author, coins);
    }

    //
    else if (sub === "轉帳") {
      if (args.length < 3) return message.safeReply("> <a:r2_rice:868583626227478591> 請提供正確的使用者名稱與金額（非現實貨幣）。");
      const target = await message.guild.resolveMember(args[1], true);
      if (!target) return message.safeReply("> <a:r2_rice:868583626227478591> 請提供正確的使用者名稱。");
      const coins = parseInt(args[2]);
      if (isNaN(coins)) return message.safeReply("> <a:r2_rice:868583626227478591> 請提供正確的金額（非現實貨幣）。");
      response = await transfer(message.author, target.user, coins);
    }

    //
    else {
      return message.safeReply("> <a:r2_rice:868583626227478591> 無效的指令用法，你真的會用指令嗎？");
    }

    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const sub = interaction.options.getSubcommand();
    let response;

    // balance
    if (sub === "餘額") {
      const user = interaction.options.getUser("使用者") || interaction.user;
      response = await balance(user);
    }

    // deposit
    else if (sub === "存款") {
      const coins = interaction.options.getInteger("金額");
      response = await deposit(interaction.user, coins);
    }

    // withdraw
    else if (sub === "提款") {
      const coins = interaction.options.getInteger("金額");
      response = await withdraw(interaction.user, coins);
    }

    // transfer
    else if (sub === "轉帳") {
      const user = interaction.options.getUser("使用者");
      const coins = interaction.options.getInteger("金額");
      response = await transfer(interaction.user, user, coins);
    }

    await interaction.followUp(response);
  },
};
