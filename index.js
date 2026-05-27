const { Client } = require('discord.js-selfbot-v13');
const express = require('express');

const app = express();
app.get('/', (req, res) => res.send('Bot giữ phòng thông minh đang chạy!'));
app.listen(process.env.PORT || 3000);

const client = new Client({ checkUpdate: false });
const TOKEN = process.env.TOKEN; 

// ==========================================
// CẤU HÌNH THÔNG TIN CỦA ÔNG TẠI ĐÂY
const LINK_PHONG_RIENG = 'https://discord.com/channels/653508294962315285/1509004985424412711'; 
const ID_BOT_CANDIJOY = '1083650933268955156';
const ID_BOT_DKIEN = '1335142767554461836';
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

        // Vào phòng cắm chốt
        toggleMic(channelId, isMuted);
        console.log("Đã vào phòng! Bắt đầu quét người lạ...");

        setInterval(() => {
            // Lấy dữ liệu của phòng voice hiện tại
            const voiceChannel = guild.channels.cache.get(channelId);
            
            if (voiceChannel) {
                // LỌC NGƯỜI LẠ: Đếm xem có ai trong phòng mà KHÔNG PHẢI là candijoy và KHÔNG PHẢI là dkien không
                const nguoiLa = voiceChannel.members.filter(m => m.id !== ID_BOT_CANDIJOY && m.id !== ID_BOT_DKIEN);

                // Nếu phát hiện có ít nhất 1 người lạ chui vào phòng
                if (nguoiLa.size > 0) {
                    console.log(`[${new Date().toLocaleTimeString()}] Phát hiện có người vào phòng! Bot tự động rút lui.`);
                    toggleMic(null, false); // Lệnh rời phòng voice
                    process.exit(0);        // Tắt máy chủ GitHub ngay lập tức để tiết kiệm phút chạy
                }

                // Nếu phòng vẫn trống, tiếp tục nháy mic giữ phòng
                isMuted = !isMuted;
                toggleMic(channelId, isMuted);
                console.log(`[${new Date().toLocaleTimeString()}] Phòng an toàn. Đang giữ phòng...`);
            } else {
                // Nếu phòng bị lỗi hoặc biến mất, tự động chui lại vào sảnh (nếu có)
                toggleMic(channelId, isMuted);
            }
        }, 60000); // Mỗi 1 phút quét 1 lần

    } catch (e) {
        console.log("Lỗi: ", e.message);
    }
});

client.login(TOKEN);
