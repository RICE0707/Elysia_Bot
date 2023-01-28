const rrSchema = require("../../Models/Events/interactions/ReactionRoles");
const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("新增身分組")
        .setDescription("新增欲給成員領取的自動身分組")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .addRoleOption(option =>
            option.setName("身分組")
                .setDescription("選擇欲給成員領取的自動身分組")
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName("描述")
                .setDescription("介紹這個身分組")
                .setRequired(false)
        ).addStringOption(option =>
            option.setName("表情符號")
                .setDescription("選擇代表這個身分組的表情符號")
                .setRequired(false)
        ),
    async execute(interaction) {
        const { options, guildId, member } = interaction;

        const role = options.getRole("身分組");
        const description = options.getString("描述");
        const emoji = options.getString("表情符號");

        try {

            if (role.position >= member.roles.highest.position)
                return interaction.reply({ content: "> 你沒有權限執行此操作！", ephemeral: true });

            const data = await rrSchema.findOne({ GuildID: guildId });

            const newRole = {
                roleId: role.id,
                roleDescription: description || "管理員未給予此身分組描述",
                roleEmoji: emoji ||"",
            }

            if (deta) {
                let roleData = data.roles.find((x) => x.roleId === role.id);

                if (roleData) {
                    roleData = newRoleData;
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

            return interaction.reply({ content: `> 已成功新增身分組：${role.name}`, ephemeral: true});
            
        } catch (err) {
            console.log(err);
        }
    }
}