const { Client, GatewayIntentBits, PermissionFlagsBits, ChannelType } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
  ]
});

const INVITE_CODE     = 'MG4Dx4mw8g';
const CATEGORY_NAME   = 'Onboarding';
const TYPEFORM_URL    = 'https://theclosersociety.typeform.com/onboarding';
const TEAM_ROLE_ID    = '1452602533565698088';

client.once('ready', () => {
  console.log(`✅ Bot online: ${client.user.tag}`);
});

client.on('guildMemberAdd', async (member) => {
  try {
    const guild = member.guild;

    // Zoek of maak de Onboarding categorie
    let category = guild.channels.cache.find(
      c => c.type === ChannelType.GuildCategory &&
           c.name.toLowerCase() === CATEGORY_NAME.toLowerCase()
    );

    if (!category) {
      category = await guild.channels.create({
        name: CATEGORY_NAME,
        type: ChannelType.GuildCategory,
      });
      console.log(`📁 Categorie aangemaakt: ${CATEGORY_NAME}`);
    }

    // Kanaalnaam: 1-op-1-[username] — alleen lowercase letters, cijfers en koppeltekens
    const cleanUsername = member.user.username
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    const channelName = `1-op-1-${cleanUsername}`;

    // Maak het privékanaal aan
    const channel = await guild.channels.create({
      name: channelName,
      type: ChannelType.GuildText,
      parent: category.id,
      permissionOverwrites: [
        {
          id: guild.id,               // @everyone — geen toegang
          deny: [PermissionFlagsBits.ViewChannel],
        },
        {
          id: member.id,              // nieuwe member — lezen + schrijven
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory,
          ],
        },
        {
          id: TEAM_ROLE_ID,           // team — lezen + schrijven
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory,
            PermissionFlagsBits.ManageMessages,
          ],
        },
      ],
    });

    // Stuur het welkomstbericht met UTM-parameters
    const typeformLink = `${TYPEFORM_URL}?utm_source=discord&utm_medium=${encodeURIComponent(member.user.username)}&utm_content=${channel.id}`;

    await channel.send(
      `Hey <@${member.id}>, welkom bij The Closer Society! 🔥 Dit is jouw privékanaal met het team.\n\n` +
      `Om je onboarding zo snel en soepel mogelijk te laten verlopen, vul even dit korte formulier in:\n` +
      `👉 ${typeformLink}\n\n` +
      `Hierin vragen we je naar je saleservaring, doelen en bedrijfsgegevens zodat we alles klaar kunnen zetten voor een vliegende start.\n\n` +
      `Zorg er ook voor dat de betaling volledig is afgerond. Zodra het formulier is ingevuld én de betaling binnen is, kunnen we direct voor je aan de slag.\n\n` +
      `Reken op maximaal 24 uur om alles aan onze kant te verwerken. Vragen in de tussentijd? Drop ze hier, we staan voor je klaar. 💪`
    );

    console.log(`✅ Kanaal aangemaakt: #${channelName} voor ${member.user.tag}`);

  } catch (err) {
    console.error('❌ Fout bij aanmaken kanaal:', err);
  }
});

client.login(process.env.DISCORD_TOKEN);
