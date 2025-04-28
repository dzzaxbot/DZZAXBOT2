const { Client, GatewayIntentBits, ActivityType } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');
const express = require('express');
const path = require('path');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent
  ],
  partials: ["CHANNEL", "MESSAGE"]
});

const app = express();
const port = 3000;
app.get('/', (req, res) => {
  const filePath = path.join(__dirname, 'index.html');
  res.sendFile(filePath);
});
app.listen(port, () => {
  console.log('\x1b[36m[ SERVER ]\x1b[0m', `\x1b[32m SH : http://localhost:${port} ✅\x1b[0m`);
});

const statusMessages = [" 📌 اكثرو من الاستغفار ", " ❤  ولا تنسو ذكر الله"];
const statusTypes = ['dnd', 'idle'];
let currentStatusIndex = 0;
let currentTypeIndex = 0;

function updateStatus() {
  const currentStatus = statusMessages[currentStatusIndex];
  const currentType = statusTypes[currentTypeIndex];
  client.user.setPresence({
    activities: [{ name: currentStatus, type: ActivityType.Custom }],
    status: currentType,
  });
  console.log('\x1b[33m[ STATUS ]\x1b[0m', `Updated status to: ${currentStatus} (${currentType})`);
  currentStatusIndex = (currentStatusIndex + 1) % statusMessages.length;
  currentTypeIndex = (currentTypeIndex + 1) % statusTypes.length;
}

function heartbeat() {
  setInterval(() => {
    console.log('\x1b[35m[ HEARTBEAT ]\x1b[0m', `Bot is alive at ${new Date().toLocaleTimeString()}`);
  }, 30000);
}

client.once('ready', async () => {
  console.log(`✅ البوت جاهز: ${client.user.tag}`);
  updateStatus();
  setInterval(updateStatus, 10000);
  heartbeat();

  const commands = [{
    name: "ping",
    description: "رد بسيط لاختبار البوت"
  }];

  const guildId = "976590576499720252";
  const guild = client.guilds.cache.get(guildId);
  if (guild) {
    await guild.commands.set(commands);
    console.log("✅ تم تسجيل أمر /ping");
  } else {
    console.log("❌ لم يتم العثور على السيرفر.");
  }
});

client.on("interactionCreate", async interaction => {
  if (!interaction.isCommand()) return;
  if (interaction.commandName === "ping") {
    await interaction.reply("🏓 Pong! البوت شغال ✅");
  }
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  const msg = message.content.toLowerCase();

  if (msg === "سلام") return message.reply("وعليكم السلام");
  if (msg === "كيف احوالك") return message.reply("الحمد لله");
  if (msg === "شكون نتا") return message.reply("انا بوت صنعني افضل يوتيوبر في العالم دييييزاكس");
  if (msg === "help") return message.reply("✅ يمكنني: \n- الرد على بعض الكلمات مثل (سلام، كيف احوالك...)\n- تنفيذ أمر /ping\n- الانضمام لقناة صوتية بالأمر !join\n- التفاعل مع الصور\n- واجهة ويب جاهزة");

  if (msg === "!join") {
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) return message.reply("🚫 لازم تكون في قناة صوتية.");
    try {
      joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: message.guild.id,
        adapterCreator: message.guild.voiceAdapterCreator
      });
      message.reply("✅ دخلت القناة الصوتية!");
    } catch (err) {
      console.error("❌ خطأ في الانضمام:", err);
      message.reply("❌ صار خطأ وأنا أحاول أنضم.");
    }
  }

  let hasImage = false;
  if (message.attachments.size > 0) {
    message.attachments.forEach(attachment => {
      if (attachment.name.match(/\.(jpg|jpeg|png|gif|webp|mp4)$/i)) {
        hasImage = true;
      }
    });
  }
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.mp4'];
  if (imageExtensions.some(ext => msg.includes(ext))) {
    hasImage = true;
  }

  if (hasImage) {
    const emojiNames = ["minecraftheart", "emoji_12", "salchicha55", "all", "peeposit69", "emoji_6", "animatedemojis", "orangealert", "scrumptious", "angryjoe"];
    for (const name of emojiNames) {
      try {
        const customEmoji = message.guild.emojis.cache.find(e => e.name === name);
        if (customEmoji) {
          await message.react(customEmoji);
        } else {
          console.log(`❌ الإيموجي ${name} غير موجود في السيرفر.`);
        }
      } catch (error) {
        console.error(`❌ خطأ أثناء إضافة الإيموجي (${name}):`, error);
      }
    }
  }
});

client.login(process.env.TOKEN);

