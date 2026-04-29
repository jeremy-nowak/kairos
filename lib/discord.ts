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
    { name: '👤 Créé par', value: username, inline: true },
    { name: '📆 Date', value: date, inline: true },
    { name: '⏰ Horaire', value: `${startTime} → ${endTime}`, inline: true },
    ...(location ? [{ name: '📍 Lieu', value: location, inline: false }] : []),
    ...(description ? [{ name: '📝 Description', value: description, inline: false }] : []),
  ]

  await fetch(process.env.DISCORD_WEBHOOK_URL!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      embeds: [
        {
          title: `📅 Nouvel événement : ${title}`,
          color: 0x4285f4,
          fields,
          timestamp: new Date().toISOString(),
          footer: { text: 'EventPing' },
        },
      ],
    }),
  })
}
