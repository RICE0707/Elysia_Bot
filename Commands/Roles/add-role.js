const rrSchema = require("../../Models/ReactionRoles");
const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("新增身分組")
        .setDescription("新增身分組到身分組選擇面板")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .addRoleOption(option =>
            option.setName("身份組")
                .setDescription("選擇身份組")
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName("描述")
                .setDescription("介紹身份組")
                .setRequired(false)
        ).addStringOption(option =>
            option.setName("表情符號")
                .setDescription("選擇表情符號")
                .setRequired(false)
        ),
    async execute(interaction) {
        const { options, guildId, member } = interaction;

        const role = options.getRole("身份組");
        const description = options.getString("描述");
        const emoji = options.getString("表情符號");

        try {

            if (role.position >= member.roles.highest.position)
                return interaction.reply({ content: "> <a:r2_rice:868583626227478591> 你沒有權限執行此操作！", ephemeral: true });

            const data = await rrSchema.findOne({ GuildID: guildId });

            const newRole = {
                roleId: role.id,
                roleDescription: description || "管理員未給予此身分組描述",
                roleEmoji: emoji || "",
            }

            if (data) {
                let roleData = data.roles.find((x) => x.roleId === role.id);

                if (roleData) {
                    roleData = newRole;
                } else {
                    data.roles = [...data.roles, newRole]
                }

                await data.save();
            } else {
                await rrSchema.create({
                    GuildID: guildId,
                    roles: newRole,
                });
            }

            return interaction.reply({ content: `> <a:r3_rice:868583679465758820> 已成功新增身份組選擇面板的身份組：${role.name}`, ephemeral: true});
            
        } catch (err) {
            console.log(err);
        }
    }
}