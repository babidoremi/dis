const { Client } = require('discord.js-selfbot-v13');
const express = require('express');

const app = express();
app.get('/', (req, res) => res.send('Bot đang cắm chốt giữ phòng bất tử!'));
app.listen(process.env.PORT || 3000);

const client = new Client({ checkUpdate: false });
const TOKEN = process.env.TOKEN; 

// ======================================================================================
// QUAN TRỌNG: Dán Link hoặc ID của cái "PHÒNG RIÊNG" mà ông vừa tạo bằng nick chính vào đây
const LINK_HOAC_ID = 'https://discord.com/channels/653508294962315285/1509004985424412711'; 
// ======================================================================================

let isMuted = false;

// Hàm tự động tách Link để lấy ID
function getDiscordIds(input) {
    if (input.includes('channels/')) {
        const parts = input.trim().split('/');
        return { guildId: parts[parts.length - 2], channelId: parts[parts.length - 1] };
    }
    // Nếu chỉ dán ID phòng thì nó tự dùng ID của Server Valorant (nhớ thay ID Server vào nhé)
    return { guildId: '653508294962315285', channelId: input };
}

client.on('ready', async () => {
    console.log(`Bot online: ${client.user.tag}`);
    try {
        const { guildId, channelId } = getDiscordIds(LINK_HOAC_ID);
        const guild = client.guilds.cache.get(guildId);

        if (!guild) return console.log("Không tìm thấy Server! Kiểm tra lại Link/ID nhé.");

        // Hàm bắn tín hiệu thẳng vào Gateway để ép nháy mic
        const toggleMic = (targetChannelId, muteState) => {
            guild.shard.send({
                op: 4,
                d: { guild_id: guildId, channel_id: targetChannelId, self_mute: muteState, self_deaf: false }
            });
        };

        // Kích hoạt bế nick vào phòng riêng ngay lập tức
        toggleMic(channelId, isMuted);
        console.log(`Đã chui tọt vào phòng ${channelId}! Bắt đầu múa mic giữ phòng...`);

        // Cứ đúng 60 giây đảo mic một lần để Discord không đá vì AFK
        setInterval(() => {
            isMuted = !isMuted;
            toggleMic(channelId, isMuted);
            console.log(`[${new Date().toLocaleTimeString()}] Đã đổi trạng thái Mic (Mute: ${isMuted})`);
        }, 60000);

    } catch (e) {
        console.log("Lỗi hệ thống: ", e.message);
    }
});

client.login(TOKEN);
