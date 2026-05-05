function getUserColor(username: string): number {
  switch (username.toLowerCase()) {
    case 'tatiana': return 0xf43f5e
    case 'jeremy':  return 0x6366f1
    default:        return 0x8b5cf6
  }
}

function getMention(person: string): string {
  if (person === 'jeremy') return process.env.DISCORD_MENTION_JEREMY ?? '@vitaly'
  return process.env.DISCORD_MENTION_TATIANA ?? '@tatiana'
}

function getLabel(person: string): string {
  return person === 'jeremy' ? 'Jérémy' : 'Tatiana'
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
  const assignees = assignedTo ? assignedTo.split(',').filter(Boolean) : []

  const fields = [
    { name: '👤 Créé par', value: `**${username}**`, inline: true },
    { name: '📆 Date',     value: `**${date}**`,     inline: true },
    { name: '⏰ Horaire',  value: `**${startTime} → ${endTime}**`, inline: true },
  ]

  if (assignees.length > 0) {
    const label = assignees.map(getLabel).join(' & ')
    fields.push({ name: '🎯 Assigné à', value: `**${label}**`, inline: true })
  }

  if (location) {
    fields.push({ name: '📍 Lieu', value: location, inline: true })
  }

  if (description) {
    fields.push({ name: '📝 Description', value: description, inline: false })
  }

  const mentions = assignees.map(getMention)
  const content = mentions.length > 0
    ? `${mentions.join(' ')} — nouvelle tâche assignée !`
    : undefined

  await fetch(process.env.DISCORD_WEBHOOK_URL!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content,
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
