function getUserColor(username: string): number {
  switch (username.toLowerCase()) {
    case 'tatiana': return 0xf43f5e
    case 'jeremy':  return 0x6366f1
    default:        return 0x8b5cf6
  }
}

export async function sendDiscordNotification({
  username,
  title,
  date,
  startTime,
  endTime,
  description,
  location,
}: {
  username: string
  title: string
  date: string
  startTime: string
  endTime: string
  description?: string
  location?: string
}) {
  const fields = [
    { name: '👤 Créé par', value: `**${username}**`, inline: true },
    { name: '📆 Date',     value: `**${date}**`,     inline: true },
    { name: '⏰ Horaire',  value: `**${startTime} → ${endTime}**`, inline: true },
  ]

  if (location || description) {
    fields.push({ name: '​', value: '​', inline: false })
  }

  if (location) {
    fields.push({ name: '📍 Lieu', value: location, inline: true })
  }

  if (description) {
    fields.push({ name: '📝 Description', value: description, inline: false })
  }

  await fetch(process.env.DISCORD_WEBHOOK_URL!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      embeds: [
        {
          title: `📅  Nouvel événement — ${title}`,
          color: getUserColor(username),
          fields,
          timestamp: new Date().toISOString(),
          footer: { text: 'Kairos' },
        },
      ],
    }),
  })
}
