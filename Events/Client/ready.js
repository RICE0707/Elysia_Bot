const {Client} = require('discord.js');
const mongoose = require('mongoose');
const config = require("../../config.json");

module.exports = {
    name: "ready",
    once: true,
    async execute(client) {
        await mongoose.connect(config.mongodb || '', {
            keepAlive: true,
        });

        if (mongoose.connect) {
            console.log(`[提示] 資料庫已連接成功`)
        }

        client.user.setPresence({ activities: [{ name: '花瓶的操你媽Js時光' }], status: 'dnd' });
        console.log(`[提示] ${client.user.username} 已開啟！`);
    },
};