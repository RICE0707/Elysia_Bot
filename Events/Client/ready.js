const {client} = require('discord.js');
const config = require("../../config.json");
const mongoose = require('mongoose');

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

        console.log(`[提示] ${client.user.tag} 已開啟！`);
    },
};