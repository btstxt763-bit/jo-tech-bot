require("dotenv").config();
const {
  Client,
  GatewayIntentBits,
  ChannelType,
  PermissionsBitField
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

client.once("ready", () => {
  console.log(`Bot Ready: ${client.user.tag}`);
});

client.on("messageCreate", async (msg) => {
  if (!msg.guild || msg.author.bot) return;

  if (msg.content !== "!buildserver FINAL") {
    if (msg.content === "!buildserver") {
      msg.reply("⚠️ الأمر خطير.\nاكتب: `!buildserver FINAL`");
    }
    return;
  }

  if (!msg.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
    return msg.reply("❌ لازم Admin");
  }

  const guild = msg.guild;
  await msg.reply("🏗️ جاري بناء سيرفر JO-TECH Services...");

  // 🧹 حذف الرومات
  for (const ch of guild.channels.cache.values()) {
    await ch.delete().catch(() => {});
  }

  // 🧹 حذف الرتب
  for (const r of guild.roles.cache.values()) {
    if (r.id !== guild.id && !r.managed) {
      await r.delete().catch(() => {});
    }
  }

  // ===== ROLES =====
  const rolesData = [
    ["👑 Owner", 0xff0000, true, [PermissionsBitField.Flags.Administrator]],
    ["🛡 Admin", 0xe67e22, true, [
      PermissionsBitField.Flags.ManageGuild,
      PermissionsBitField.Flags.ManageChannels,
      PermissionsBitField.Flags.ManageRoles
    ]],
    ["🎧 Support", 0x3498db, true, [
      PermissionsBitField.Flags.ManageMessages,
      PermissionsBitField.Flags.ViewChannel
    ]],
    ["💼 Client", 0x2ecc71, false, []],
    ["👤 Member", 0x95a5a6, false, [
      PermissionsBitField.Flags.ViewChannel,
      PermissionsBitField.Flags.SendMessages
    ]]
  ];

  const R = {};
  for (const [name, color, hoist, perms] of rolesData) {
    R[name] = await guild.roles.create({ name, color, hoist, permissions: perms });
  }

  // ===== CATEGORIES =====
  const cats = {};
  for (const name of ["📢 INFO", "🎫 SUPPORT", "💬 COMMUNITY", "🛠 STAFF"]) {
    cats[name] = await guild.channels.create({ name, type: ChannelType.GuildCategory });
  }

  const createText = (name, parent, overwrites) =>
    guild.channels.create({
      name,
      type: ChannelType.GuildText,
      parent,
      permissionOverwrites: overwrites
    });

  // INFO
  for (const n of ["welcome", "rules", "services", "prices"]) {
    await createText(n, cats["📢 INFO"], [
      { id: guild.roles.everyone.id, deny: [PermissionsBitField.Flags.SendMessages] }
    ]);
  }

  // SUPPORT
  await createText("open-ticket", cats["🎫 SUPPORT"], [
    { id: guild.roles.everyone.id, allow: [PermissionsBitField.Flags.ViewChannel], deny: [PermissionsBitField.Flags.SendMessages] }
  ]);

  await createText("ticket-log", cats["🎫 SUPPORT"], [
    { id: guild.roles.everyone.id, deny: [PermissionsBitField.Flags.ViewChannel] },
    { id: R["🎧 Support"].id, allow: [PermissionsBitField.Flags.ViewChannel] }
  ]);

  // COMMUNITY
  for (const n of ["general", "feedback"]) {
    await createText(n, cats["💬 COMMUNITY"], [
      { id: guild.roles.everyone.id, deny: [PermissionsBitField.Flags.SendMessages] },
      { id: R["👤 Member"].id, allow: [PermissionsBitField.Flags.SendMessages] }
    ]);
  }

  // STAFF
  for (const n of ["staff-chat", "logs"]) {
    await createText(n, cats["🛠 STAFF"], [
      { id: guild.roles.everyone.id, deny: [PermissionsBitField.Flags.ViewChannel] },
      { id: R["👑 Owner"].id, allow: [PermissionsBitField.Flags.ViewChannel] },
      { id: R["🛡 Admin"].id, allow: [PermissionsBitField.Flags.ViewChannel] }
    ]);
  }

  msg.channel.send("✅ تم إنشاء سيرفر JO-TECH Services بنجاح!");
});

client.login(process.env.TOKEN);