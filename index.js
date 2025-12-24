require("dotenv").config();
const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  PermissionsBitField
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

/* ================== READY ================== */
client.once("ready", async () => {
  console.log(`✅ Core Bot Ready: ${client.user.tag}`);

  // قفل رومات المعلومات تلقائي
  const LOCK_CHANNEL_NAMES = ["welcome", "rules", "services", "prices"];

  client.guilds.cache.forEach(async (guild) => {
    LOCK_CHANNEL_NAMES.forEach(async (name) => {
      const channel = guild.channels.cache.find(
        (c) => c.name === name && c.isTextBased()
      );

      if (channel) {
        await channel.permissionOverwrites.edit(
          guild.roles.everyone,
          { SendMessages: false }
        );
      }
    });
  });
});

/* ================== MEMBER JOIN ================== */
client.on("guildMemberAdd", async (member) => {
  try {
    /* === Auto Role === */
    const role = member.guild.roles.cache.get(process.env.AUTO_ROLE_ID);
    if (role) await member.roles.add(role).catch(() => {});

    /* === Welcome Embed (ONE ONLY) === */
    const welcomeChannel = member.guild.channels.cache.get(
      process.env.WELCOME_CHANNEL_ID
    );
    if (!welcomeChannel) return;

    const embed = new EmbedBuilder()
      .setColor("#5865F2")
      .setAuthor({
        name: "Welcome to JO-TECH Services",
        iconURL: member.guild.iconURL()
      })
      .setDescription(
        `💙 أهلاً بيك ${member}\n\n` +
        `👥 عدد أعضاء السيرفر الآن: **${member.guild.memberCount}**\n\n` +
        `📌 اقرأ القوانين قبل أي حاجة\n` +
        `🛠 شوف خدماتنا المتاحة\n` +
        `🎫 محتاج مساعدة؟ افتح تكت`
      )
      .setThumbnail(member.user.displayAvatarURL())
      .setFooter({ text: "JO-TECH Services" })
      .setTimestamp();

    await welcomeChannel.send({ embeds: [embed] });

    /* === LOG JOIN === */
    const logChannel = member.guild.channels.cache.get(
      process.env.LOG_CHANNEL_ID
    );
    if (logChannel) {
      logChannel.send(
        `🟢 **Member Joined:** ${member.user.tag} (${member.id})`
      );
    }

  } catch (err) {
    console.error("Join Error:", err);
  }
});

/* ================== MEMBER LEAVE ================== */
client.on("guildMemberRemove", async (member) => {
  try {
    /* === DM User === */
    await member.send(
      `💙 خرجت من سيرفر **JO-TECH Services**  
لو احتاجت أي خدمة أو رجعت تغير رأيك، السيرفر مفتوح ليك دايمًا ❤️`
    ).catch(() => {});

    /* === LOG LEAVE === */
    const logChannel = member.guild.channels.cache.get(
      process.env.LOG_CHANNEL_ID
    );
    if (logChannel) {
      logChannel.send(
        `🔴 **Member Left:** ${member.user.tag} (${member.id})`
      );
    }
  } catch (err) {
    console.error("Leave Error:", err);
  }
});

/* ================== LOGIN ================== */
client.login(process.env.TOKEN);
