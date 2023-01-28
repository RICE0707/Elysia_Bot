const { EmbedBuilder, SlashCommandBuilder, ChannelType, GuildVerificationLevel, GuildExplicitContentFilter, GuildNSFWLevel } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("伺服器資訊")
        .setDescription("取得伺服器(群組)資訊")
        .setDMPermission(false),
    async execute(interaction) {
        const { guild } = interaction;

        const { GuildExplicitContentFilter, GuildNSFWLevelguild, GuildVerificationLevel } = guild;
        const { members, channels, emojis, roles, stickers } = guild;

        const sortedRoles = roles.cache.map(role => role).slice(1, roles.cache.size).sort((a, b) => b.position - a.position);
        const userRoles = sortedRoles.filter(role => !role.managed);
        const managedRoles = sortedRoles.filter(role => role.managed);
        const botCount = members.cache.filter(member => member.user.bot).size;

        const maxDisplayRoles = (roles, maxFieldLength = 1024) => {
            let totalLength = 0;
            const result = [];

            for (const role of roles) {
                const roleString = `<@&${role.id}>`;

                if (roleString.length + totalLength > maxFieldLength)
                break;

                totalLength += roleString.length + 1;
                result.push(roleString);
            }

            return result.length;
        }

        const getChannelTypeSize = type => channels.cache.filter(channel => type.includes(channel.type)).size;

        const totalChannels = getChannelTypeSize([ ChannelType.GuildText, ChannelType.GuildNews, ChannelType.GuildVoice, ChannelType.GuildStageVoice, ChannelType.GuildForum, ChannelType.GuildPublicThread, ChannelType.GuildPrivateThread, ChannelType.GuildNewsThread, ChannelType.GuildCategory ]);
    
        const embed = new EmbedBuilder()
            .setColor("0xd3d7da")
            .setAuthor({ name: `你就是個偷窺狂吧！`, iconURL: (guild.iconURL({ size: 1024 })), url: 'https://github.com/RICE0707/Elysia_Js_V2' })
            .setTitle(`${guild.name} 的伺服器資訊`)
            .setImage(guild.bannerURL({ size: 1024 }))
            .setTimestamp()
            .setFooter({ text: '來自花瓶星球的科技支援 v2.1', iconURL: 'https://cdn.discordapp.com/attachments/1067805752183488663/1068501885193039973/1015210055_61696d776b439.jpg' })
            .addFields(
                { name: "伺服器描述", value: `> ${guild.description || "> 這個伺服器沒有提供任何描述"}\n\u200B`},
                {
                    name: "基礎資訊",
                    value: [
                        `├ 創建日期：<t:${parseInt(guild.createdAt / 1000)}:f>`,
                        `├ 伺服器ＩＤ：${parseInt(guild.id)}`,
                        `├ 伺服器所有者：<@${guild.ownerId}>`,
                        `├ 伺服器語言：${new Intl.DisplayNames(["en"], { type: "language"}).of(guild.preferredLocale)}`,
                        `└ 自定義網址：${guild.vanityURLCode || "這個伺服器沒有自定義網址"}\n\u200B`,
                    ].join("\n")
                },
                { 
                    name: `成員數總覽（共${guild.memberCount}人）`,
                    value: [
                        `├ 使用者數：${guild.memberCount - botCount}人`,
                        `└ 機器人數：${botCount}人\n\u200B`
                    ].join("\n"),
                    inline: true
                },
                {
                    name: `伺服器身分組（${maxDisplayRoles(userRoles)} / ${userRoles.length}）`,
                    value: `${userRoles.slice(0, maxDisplayRoles(userRoles)).join(" ") || "> 這個伺服器沒有使用者身分組"}\n\u200B`
                },
                {
                    name: `自動分配身分組（${maxDisplayRoles(managedRoles)} / ${managedRoles.length}）`,
                    value: `${managedRoles.slice(0, maxDisplayRoles(managedRoles)).join(" ") || "> 這個伺服器沒有自動分配身分組"}\n\u200B`
                },
                {
                    name: `頻道與類別總覽`,
                    value: [
                        `├ （共${totalChannels}個）`,
                        `├ 文字頻道：${getChannelTypeSize([ChannelType.GuildText, ChannelType.GuildForum, ChannelType.GuildNews])}`,
                        `├ 語音頻道：${getChannelTypeSize([ChannelType.GuildVoice, ChannelType.GuildStageVoice])}`,
                        `└ 討論串數：${getChannelTypeSize([ChannelType.GuildPublicThread, ChannelType.GuildPrivateThread, ChannelType.GuildNewsThread])}\n\u200B`,
                    ].join("\n"),
                    inline: true
                },
                {
                    name: `表符與貼圖總覽`,
                    value: [
                        `├ （共${emojis.cache.size + stickers.cache.size}個）`,
                        `├ 動態表符：${emojis.cache.filter(emoji => emoji.animated).size}`,
                        `├ 靜態表符：${emojis.cache.filter(emoji => !emoji.animated).size}`,
                        `└ 貼圖數量：${stickers.cache.size}\n\u200B`
                    ].join("\n"),
                    inline: true
                },
                {
                    name: `加成資訊總覽`,
                    value: [
                        `├ 加成的等級：${guild.premiumTier || "這個伺服器沒有加成"}`,
                        `└ 加成總數量：${guild.premiumSubscriptionCount}\n\u200B`,
                    ].join("\n"),
                    inline: true
                },
                { name: "伺服器橫幅", value: guild.bannerURL() ? "** **" : "> 這個伺服器沒有橫幅"}
            )
            interaction.reply({ embeds: [embed]})
    }
}