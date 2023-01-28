const rrSchema = require("../../Models/ReactionRoles");
const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("發送身分組選擇面板")
        .setDescription("發送成員領取可身分組的面板")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
        async execute(interaction) {
            const { options, guildId, guild, channel } = interaction;

            try {
                const data = await rrSchema.findOne({ GuildID: guildId });

                if (!data.roles.length > 0)
                    return interaction.reply({ content: "> <a:r2_rice:868583626227478591> 這個伺服器沒有任何數據！", ephemeral: true});

                const panelEmbed = new EmbedBuilder()
                    .setTitle(`<a:r3_rice:868583679465758820> 白嫖身分組的時候到了！`)
                    .setDescription("請選擇你要白嫖的身分組")
                    .setColor(0x76ff4d)
                    .setTimestamp()
                    .setThumbnail(`https://cdn.discordapp.com/attachments/1067805752183488663/1068501885193039973/1015210055_61696d776b439.jpg`)
                    .setFooter({ text: '來自花瓶星球的科技支援 v2.1', iconURL: 'https://cdn.discordapp.com/attachments/1067805752183488663/1068501885193039973/1015210055_61696d776b439.jpg' });

                const options = data.roles.map(x => {
                    const role = guild.roles.cache.get(x.roleId);

                    return {
                        label: role.name,
                        value: role.id,
                        description: x.roleDescription,
                        emoji: x.roleEmoji || undefined
                    };
                });

                const menuComponents = [
                    new ActionRowBuilder().addComponents(
                        new StringSelectMenuBuilder()
                            .setCustomId('reaction-roles')
                            .setMaxValues(options.length)
                            .addOptions(options),
                    ),
                ];

                channel.send({ embeds: [panelEmbed], components: menuComponents });

                return interaction.reply({ content: `> <a:r3_rice:868583679465758820> 已發送身分組選擇面板！`, ephemeral: true});
            } catch (err) {
                console.log(err);
            }
        }
    }