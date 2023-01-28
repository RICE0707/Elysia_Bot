const rrSchema = require("../../Models/ReactionRoles");
const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("移除身分組")
        .setDescription("從身分組選擇面板移除身分組")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .addRoleOption(option =>
            option.setName("身份組")
                .setDescription("選擇身份組")
                .setRequired(true)
        ),
    async execute(interaction) {
        const { options, guildId, member } = interaction;

        const role = options.getRole("身份組");

        try {

            const data = await rrSchema.findOne({ GuildID: guildId });

            if (!data)
                return interaction.reply({ content: `> <a:r2_rice:868583626227478591> 這個伺服器沒有任何數據！`, ephemeral: true});
            
            const roles = data.roles;
            const findRole = roles.find((r) => r.roleId === role.id);

            if(!findRole)
                return interaction.reply({ content: `> <a:r2_rice:868583626227478591> 這個身份組不存在！`, ephemeral: true});

            const filteredRoles = roles.filter((r) => r.roleId === role.id);
            data.roles = filteredRoles;

            await data.save();

            return interaction.reply({ content: `> <a:r3_rice:868583679465758820> 已成功從身分組選擇面板移除身分組：${role.name}`, ephemeral: true});
            
        } catch (err) {
            console.log(err);
        }
    }
}