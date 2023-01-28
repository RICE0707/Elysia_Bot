const rrSchema = require("../../Models/Events/interactions/ReactionRoles");
const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("移除身分組")
        .setDescription("移除欲給成員領取的自動身分組")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .addRoleOption(option =>
            option.setName("身分組")
                .setDescription("選擇欲給成員領取的自動身分組")
                .setRequired(true)
        ),
    async execute(interaction) {
        const { options, guildId, member } = interaction;

        const role = options.getRole("身分組");

        try {

            const data = await rrSchema.findOne({ GuildID: guildId });

            if (!deta)
                return interaction.reply({ content: `> 這個伺服器沒有任何數據！`, ephemeral: true});
            
            const roles = data.roles;
            const findRole = roles.find((r) => r.roleId === role.id);

            if(!findRole)
                return interaction.reply({ content: `> 這個身分組不存在！`, ephemeral: true});

            const filteredRoles = roles.filter((r) => r.roleId === role.id);
            data.roles = filteredRoles;

            await data.save();

            return interaction.reply({ content: `> 已成功新增身分組：${role.name}`});
            
        } catch (err) {
            console.log(err);
        }
    }
}