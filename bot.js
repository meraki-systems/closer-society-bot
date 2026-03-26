const { Client, GatewayIntentBits, PermissionFlagsBits, ChannelType } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
  ]
});

const CATEGORY_NAME       = 'Onboarding';
const TYPEFORM_URL        = 'https://theclosersociety.typeform.com/onboarding';

const ROLE_MEMBER         = '1452602533565698088'; // Closer Society Member — geen toegang
const ROLE_COACH          = '1452602403110129806'; // Coach — toegang
const ROLE_ADMIN          = '1452603416340729908'; // Admin — toegang
const ROLE_FOUNDER        = '1486682346542596139'; // Founder — toegang

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

client.once('ready', () => {
  console.log(`✅ Bot online: ${client.user.tag}`);
});

client.on('guildMemberAdd', async (member) => {
  try {
    const guild = member.guild;

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

    const cleanUsername = member.user.username
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    const channelName = `1-op-1-${cleanUsername}`;

    const channel = await guild.channels.create({
      name: channelName,
      type: ChannelType.GuildText,
      parent: category.id,
      permissionOverwrites: [
        {
          id: guild.id,           // @everyone — geen toegang
          deny: [PermissionFlagsBits.ViewChannel],
        },
        {
          id: ROLE_MEMBER,        // Closer Society Member — expliciet geblokkeerd
          deny: [PermissionFlagsBits.ViewChannel],
        },
        {
          id: client.user.id,     // Bot — volledige toegang
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory,
            PermissionFlagsBits.ManageMessages,
          ],
        },
        {
          id: member.id,          // Nieuwe member — lezen + schrijven
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory,
          ],
        },
        {
          id: ROLE_COACH,         // Coach — lezen + schrijven
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory,
            PermissionFlagsBits.ManageMessages,
          ],
        },
        {
          id: ROLE_ADMIN,         // Admin — lezen + schrijven
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory,
            PermissionFlagsBits.ManageMessages,
          ],
        },
        {
          id: ROLE_FOUNDER,       // Founder — lezen + schrijven
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory,
            PermissionFlagsBits.ManageMessages,
          ],
        },
      ],
    });

    console.log(`📁 Kanaal aangemaakt: #${channelName} — wacht 2 seconden...`);
    await sleep(2000);

    const typeformLink = `${TYPEFORM_URL}?UTM_Source=discord&UTM_Medium=${encodeURIComponent(member.user.username)}&UTM_Content=${member.id}&UTM_Term=${channel.id}`;

    await channel.send(
      `Hey <@${member.id}>, welkom bij The Closer Society! 🔥 Dit is jouw privékanaal met het team.\n\n` +
      `Om je onboarding zo snel en soepel mogelijk te laten verlopen, vul even dit korte formulier in:\n` +
      `[Ga naar onboardingsformulier](<${typeformLink}>)\n\n` +
      `Hierin vragen we je naar je saleservaring, doelen en bedrijfsgegevens zodat we alles klaar kunnen zetten voor een vliegende start.\n\n` +
      `Zorg er ook voor dat de betaling volledig is afgerond. Zodra het formulier is ingevuld én de betaling binnen is, kunnen we direct voor je aan de slag.\n\n` +
      `Reken op maximaal 24 uur om alles aan onze kant te verwerken. Vragen in de tussentijd? Drop ze hier, we staan voor je klaar. 💪`
    );

    console.log(`✅ Bericht gestuurd in #${channelName} voor ${member.user.tag}`);

  } catch (err) {
    console.error('❌ Fout:', err);
  }
});

client.login(process.env.DISCORD_TOKEN);
