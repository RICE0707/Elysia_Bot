const { CommandInteraction } = require("discord.js");

module.exports = {
    name: "interactionCreate",

    async execute(interaction, client) {
        const { customId, values, guild, member } = interaction;
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) {
                return interaction.reply({ content: "> 指令已超時，請重來一次 :P", ephemeral: true});
            }
            command.execute(interaction, client);
        }   else if (interaction.isButton()) {

            if (customId == "驗證") {
                const role = interaction.guild.roles.cache.get("927231092363247666");
                return interaction.member.roles.add(role).then((member) =>
                    interaction.reply({
                        content: `> 已將 ${role} 分配於你`,
                        ephemeral: true,
                    })
                );
            }
        } else if(interaction.isSelectMenu()) {
            if (customId == "reaction-roles") {
                for (let i = 0; i < values.length; i++) {
                    const roleId = values[i];

                    const role = guild.roles.cache.get(roleId);
                    const hasRole = member.roles.cache.get(roleId);

                    switch (hasRole) {
                        case true:
                            member.roles.remove(roleId);
                            break;
                        case false:
                            member.roles.add(roleId);
                            break;
                    }
                }

                interaction.reply({ content: "> 身分組已更新！", ephemeral: true });
            }
        }   else {
            return;
        }
    },
};