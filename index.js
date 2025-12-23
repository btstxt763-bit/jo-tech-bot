require("dotenv").config();
const { 
  Client, 
  GatewayIntentBits, 
  EmbedBuilder 
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// ====== IDs ======
const WELCOME_CHANNEL_ID = "1453027053468254371";
const AUTO_ROLE_ID = "1453027043661971518";

// ====== READY ======
client.once("ready", () => {
  console.log(`✅ Bot Ready: ${client.user.tag}`);
});

// ====== MEMBER JOIN ======
client.on("guildMemberAdd", async (member) => {
  try {
    // 🎭 إضافة رول تلقائي
    const role = member.guild.roles.cache.get(AUTO_ROLE_ID);
    if (role) {
      await member.roles.add(role);
    }

    // 📢 روم الترحيب
    const channel = await member.guild.channels.fetch(WELCOME_CHANNEL_ID);
    if (!channel) return;

    // 📨 رسالة الترحيب
    const embed = new EmbedBuilder()
      .setColor("#5865F2")
      .setTitle("👋 Welcome to JO-TECH Services")
      .setDescription(
        `أهلاً بيك ${member} 💙\n\n` +
        `👥 عدد أعضاء السيرفر الآن: **${member.guild.memberCount}**\n\n` +
        `📌 اقرأ القوانين قبل أي حاجة\n` +
        `🛠 شوف خدماتنا المتاحة\n` +
        `🎫 محتاج مساعدة؟ افتح تكت`
      )
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .setFooter({ text: "JO-TECH Services" })
      .setTimestamp();

    await channel.send({ embeds: [embed] });

  } catch (err) {
    console.error("❌ Welcome Error:", err);
  }
});

// ====== LOGIN ======
client.login(process.env.TOKEN);
