process.env.JWT_SECRET = 'test-jwt-secret-at-least-32-characters-long'
process.env.USERS_CONFIG = JSON.stringify([
  { username: 'Alice', password: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy' }, // "password"
])
process.env.SUPABASE_URL = 'https://test.supabase.co'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key'
process.env.DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/test'
process.env.ICAL_SECRET = 'test-ical-secret'
