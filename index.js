const { Client } = require('discord.js-selfbot-v13');
const express = require('express');

const app = express();
app.get('/', (req, res) => res.send('Bot giữ phòng thông minh có nhận diện Chủ Room!'));
app.listen(process.env.PORT || 3000);

const client = new Client({ checkUpdate: false });
const TOKEN = process.env.TOKEN; 

// ==========================================
// CẤU HÌNH THÔNG TIN CỦA ÔNG TẠI ĐÂY
const LINK_PHONG_RIENG = 'https://discord.com/channels/653508294962315285/1509004985424412711'; 
const ID_CHU_ROOM = '897847285122228244'; // Bot sẽ quét ID này
// ==========================================

let isMuted = false;
let soPhutChuRoomXuatHien = 0; // Bộ đếm thời gian

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
        console.log("Đã vào phòng! Đang canh gác chờ Chủ Room...");

        // Mạch lặp 60 giây (1 phút) quét 1 lần
        setInterval(() => {
            const voiceChannel = guild.channels.cache.get(channelId);
            
            if (voiceChannel) {
                // Kiểm tra xem ID Nick Chính của ông có đang đứng trong phòng không
                const chuRoomCoMat = voiceChannel.members.has(ID_CHU_ROOM);

                if (chuRoomCoMat) {
                    soPhutChuRoomXuatHien++;
                    console.log(`Phát hiện Chủ Room! Đang đếm ngược bàn giao: ${soPhutChuRoomXuatHien}/10 phút.`);

                    // Nếu chủ room đứng liên tục đủ 10 phút
                    if (soPhutChuRoomXuatHien >= 10) {
                        console.log("Chủ Room đã ổn định 10 phút. Bot bàn giao phòng và tự ngắt kết nối để tiết kiệm tài nguyên!");
                        toggleMic(null, false); // Rút bot khỏi phòng voice
                        process.exit(0);        // Khai tử máy chủ GitHub ngay lập tức
                    }
                } else {
                    // Nếu chủ room không có mặt, hoặc vừa vào 3 phút đã rớt mạng văng ra ngoài
                    if (soPhutChuRoomXuatHien > 0) {
                        console.log("Chủ Room đã rời đi sớm. Hủy lệnh bàn giao, tiếp tục cắm chốt giữ phòng!");
                    }
                    soPhutChuRoomXuatHien = 0; // Reset bộ đếm về 0
                }

                // Nếu chưa out, tiếp tục nhiệm vụ nháy mic giữ phòng
                isMuted = !isMuted;
                toggleMic(channelId, isMuted);
            } else {
                console.log("Phòng bị lỗi, tiến hành gửi lại lệnh kết nối...");
                toggleMic(channelId, isMuted);
            }
        }, 60000); 

    } catch (e) {
        console.log("Lỗi: ", e.message);
    }
});

client.login(TOKEN);
