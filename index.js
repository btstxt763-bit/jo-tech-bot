require("dotenv").config();
const {
  Client,
  GatewayIntentBits,
  ChannelType,
  EmbedBuilder,
  PermissionsBitField
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// ===== IDs =====
const AUTO_ROLE_ID = "1453027043661971518";
const WELCOME_CHANNEL_ID = "1453027053468254371";
const LOG_CHANNEL_ID = "1453027073013579999";
const INVITE_LINK = "https://discord.gg/DmpH9XAR9B";

// 🔒 رومات Read Only
const LOCKED_CHANNEL_IDS = [
  "1453087770775130293",
  "1453027053468254371",
  "1453027055254900909",
  "1453027056794210448",
  "1453027058744561725",
  "1453027060371951719"
];

// ===== READY =====
client.once("ready", async () => {
  console.log(`✅ Bot Ready: ${client.user.tag}`);

  for (const guild of client.guilds.cache.values()) {
    for (const channelId of LOCKED_CHANNEL_IDS) {
      const channel = guild.channels.cache.get(channelId);
      if (!channel) continue;

      await channel.permissionOverwrites.edit(
        guild.roles.everyone,
        { SendMessages: false }
      ).catch(() => {});

      sendLog(guild, "قفل روم تلقائي", `🔒 تم قفل الروم ${channel}`);
    }
  }
});

// ===== MEMBER JOIN =====
client.on("guildMemberAdd", async (member) => {
  // رول تلقائي
  const role = member.guild.roles.cache.get(AUTO_ROLE_ID);
  if (role) await member.roles.add(role).catch(() => {});

  // رسالة ترحيب
  const welcome = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
  if (welcome) {
    welcome.send(`👋 أهلاً بيك ${member} | عدد الأعضاء: **${member.guild.memberCount}**`);
  }

  // DM
  try {
    const embed = new EmbedBuilder()
      .setColor("#5865F2")
      .setTitle("👋 نورت سيرفر JO-TECH")
      .setDescription(
        `لو خرجت بالغلط تقدر ترجع من هنا 👇\n\n${INVITE_LINK}\n\n` +
        "📌 شوف القوانين\n🛠 شوف الخدمات\n🎫 افتح تكت في أي وقت"
      )
      .setTimestamp();

    await member.send({ embeds: [embed] });
  } catch {}

  sendLog(member.guild, "عضو دخل", `${member} دخل السيرفر`);
});

// ===== MEMBER LEAVE =====
client.on("guildMemberRemove", (member) => {
  sendLog(member.guild, "عضو خرج", `${member.user.tag} خرج من السيرفر`);
});

// ===== LOG FUNCTION =====
async function sendLog(guild, title, description) {
  const logChannel = guild.channels.cache.get(LOG_CHANNEL_ID);
  if (!logChannel) return;

  const embed = new EmbedBuilder()
    .setColor("#2f3136")
    .setTitle(`📜 ${title}`)
    .setDescription(description)
    .setTimestamp();

  logChannel.send({ embeds: [embed] }).catch(() => {});
}

// ===== LOGIN =====
client.login(process.env.TOKEN);
