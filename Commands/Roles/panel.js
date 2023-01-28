const rrSchema = require("../../Models/ReactionRoles");
const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, BaseSelectMenuBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("發送身分組選擇面板")
        .setDescription("發送欲給成員領取的自動身分組的面板")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
    async execute(interaction) {
        const { options, guildId, guild, channel } = interaction;

        try {
            const data = await rrSchema.findOne({ GuildID: guildId });

            if (!data.roles.length > 0)
                return interaction.reply({ content: `> 這個伺服器沒有任何數據！`, ephemeral: true});

            const panelEmbed = new EmbedBuilder()
                .setDescription("請選擇你要領取的身分組")
                .setColor(0xff4e4e)

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
                    new SelectMentBuilder()
                        .setCustomId('reaction-roles')
                        .setMaxVallues(options.length)
                        .addOptions(options),
                ),
            ];

            channel.send({ embeds: [panelEmbed], components: menuComponents });

            return interaction.reply({ content: `> 已發送身分組選擇面板！`, ephemeral: true});
        } catch (err) {
            console.log(err);
        }
    }
}