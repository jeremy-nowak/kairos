function getUserColor(username: string): number {
  switch (username.toLowerCase()) {
    case 'tatiana': return 0xf43f5e
    case 'jeremy':  return 0x6366f1
    default:        return 0x8b5cf6
  }
}

function getAssigneeMention(assignedTo: string): string {
  if (assignedTo === 'jeremy') {
    return process.env.DISCORD_MENTION_JEREMY ?? '@vitaly'
  }
  return process.env.DISCORD_MENTION_TATIANA ?? '@tatiana'
}

export async function sendDiscordNotification({
  username,
  title,
  date,
  startTime,
  endTime,
  description,
  location,
  assignedTo,
}: {
  username: string
  title: string
  date: string
  startTime: string
  endTime: string
  description?: string
  location?: string
  assignedTo?: string
}) {
  const fields = [
    { name: '👤 Créé par', value: `**${username}**`, inline: true },
    { name: '📆 Date',     value: `**${date}**`,     inline: true },
    { name: '⏰ Horaire',  value: `**${startTime} → ${endTime}**`, inline: true },
  ]

  if (assignedTo) {
    const label = assignedTo === 'jeremy' ? 'Jérémy' : 'Tatiana'
    fields.push({ name: '🎯 Assigné à', value: `**${label}**`, inline: true })
  }

  if (location) {
    fields.push({ name: '📍 Lieu', value: location, inline: true })
  }

  if (description) {
    fields.push({ name: '📝 Description', value: description, inline: false })
  }

  const mention = assignedTo ? getAssigneeMention(assignedTo) : undefined

  await fetch(process.env.DISCORD_WEBHOOK_URL!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content: mention ? `${mention} — nouvelle tâche assignée !` : undefined,
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
