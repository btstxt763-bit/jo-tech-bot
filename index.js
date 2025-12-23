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
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// ===== IDs =====
const WELCOME_CHANNEL_ID = "1453027053468254371";
const AUTO_ROLE_ID = "1453027043661971518";

// ===== INVITES CACHE =====
const invitesCache = new Map();

// ===== READY =====
client.once("ready", async () => {
  console.log(`✅ Bot Ready: ${client.user.tag}`);

  // نخزن الانفايتات أول ما البوت يشتغل
  for (const [guildId, guild] of client.guilds.cache) {
    const invites = await guild.invites.fetch();
    invitesCache.set(
      guildId,
      new Map(invites.map(inv => [inv.code, inv.uses]))
    );
  }
});

// ===== MEMBER JOIN =====
client.on("guildMemberAdd", async (member) => {
  try {
    // ===== رول تلقائي =====
    const role = member.guild.roles.cache.get(AUTO_ROLE_ID);
    if (role) await member.roles.add(role).catch(() => {});

    // ===== تحديد مين اللي دعاه =====
    let inviter = "غير معروف";
    const newInvites = await member.guild.invites.fetch();
    const oldInvites = invitesCache.get(member.guild.id);

    for (const [code, invite] of newInvites) {
      const oldUses = oldInvites?.get(code);
      if (oldUses !== undefined && invite.uses > oldUses) {
        inviter = invite.inviter
          ? `<@${invite.inviter.id}>`
          : "غير معروف";
        break;
      }
    }

    // تحديث الكاش
    invitesCache.set(
      member.guild.id,
      new Map(newInvites.map(inv => [inv.code, inv.uses]))
    );

    // ===== روم الترحيب =====
    const channel = await member.guild.channels.fetch(WELCOME_CHANNEL_ID);
    if (!channel) return;

    // ===== رسالة الترحيب =====
    const embed = new EmbedBuilder()
      .setColor("#5865F2")
      .setTitle("👋 Welcome to JO-TECH Services")
      .setDescription(
        `أهلاً بيك ${member} 💙\n\n` +
        `👤 تمت إضافتك بواسطة: ${inviter}\n` +
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
    console.error("❌ Invite Tracker Error:", err);
  }
});

// ===== LOGIN =====
client.login(process.env.TOKEN);
