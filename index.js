const { Client } = require('discord.js-selfbot-v13');
const express = require('express');

const app = express();
app.get('/', (req, res) => res.send('Bot candijoy gác đêm lì lợm đang chạy!'));
app.listen(process.env.PORT || 3000);

const client = new Client({ checkUpdate: false });
const TOKEN = process.env.TOKEN; 

// ==========================================
// CẤU HÌNH THÔNG TIN CỦA ÔNG TẠI ĐÂY
const LINK_PHONG_RIENG = 'https://discord.com/channels/653508294962315285/1510863939976691792'; 
// ==========================================

let isMuted = false;

function getDiscordIds(input) {
    if (input.includes('channels/')) {
        const parts = input.trim().split('/');
        return { guildId: parts[parts.length - 2], channelId: parts[parts.length - 1] };
    }
    return { guildId: '653508294962315285', channelId: input };
}

client.on('ready', async () => {
    console.log(`Bot online: ${client.user.tag}`);
    try {
        const { guildId, channelId } = getDiscordIds(LINK_PHONG_RIENG);
        const guild = client.guilds.cache.get(guildId);
        
        if (!guild) return console.log("Không tìm thấy Server!");

        const toggleMic = (targetChannelId, muteState) => {
            guild.shard.send({
                op: 4,
                d: { guild_id: guildId, channel_id: targetChannelId, self_mute: muteState, self_deaf: false }
            });
        };

        // Kích hoạt bế nick vào phòng
        toggleMic(channelId, isMuted);
        console.log("Đã vào phòng! Bắt đầu gác xuyên đêm không rút...");

        // Mạch lặp 60 giây (1 phút) đảo mic 1 lần để giữ mạng
        setInterval(() => {
            isMuted = !isMuted;
            toggleMic(channelId, isMuted);
            console.log(`[${new Date().toLocaleTimeString()}] Đang giữ phòng lì lợm (Mute: ${isMuted})`);
        }, 60000); 

    } catch (e) {
        console.log("Lỗi: ", e.message);
    }
});

client.login(TOKEN);
