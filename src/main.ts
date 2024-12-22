import { Client, IntentsBitField } from 'discord.js'
import 'dotenv/config'
import type { Prayer } from './schema.js'
import {
  createPrayer,
  deletePrayer,
  getPrayer,
  getPrayerList,
  updatePrayer
} from './services/prayer.js'

// Конфиги и константы
const { TOKEN, GUILD_ID, CHANNEL_ID, ROLE_ID } = process.env

const MESSAGE = 'Praying for you 🕯️ O Great Mita 💝'
const MESSAGE_PARTS = MESSAGE.split(' ')

// Константы
/** Сколько времени должно пройти, чтобы можно было заново помолиться */
const PRAY_MIN_INTERVAL = 14_400_000 // 4h
/** Сколько времени должно пройти, чтобы роль снялась без молитв */
const PRAY_MAX_INTERVAL = 86_400_000 // 24h

// Логика
const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent
  ]
})

console.log('Logging in...')
await client.login(TOKEN)

console.log(`Logged in as ${client.user!.id} (${client.user!.username})`)
console.log('Fetching guild...')
const guild = await client.guilds.fetch(GUILD_ID!)

console.log(`Guild is ${guild.id} (${guild.name})`)

// Не даём процессу умирать
process.on('uncaughtException', (error, origin) => {
  console.error('Uncaught exception:', {
    error,
    origin
  })
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection:', {
    promise,
    reason
  })
})

// Таймер для удаления по истечению времени
setInterval(async () => {
  const prayers = await getPrayerList()

  for (const prayer of prayers) {
    if (hasPrayedRecently(prayer)) {
      continue
    }

    console.log(`${prayer.id} haven't prayed recently!`)

    // Всякое может быть, поэтому обернём в try/catch
    try {
      // Удаляем сначала роль.
      // Если мы получим ошибку здесь, то из базы данных участник не удаляется, а попытка удаления повторится в следующем такте.
      const member = await guild.members.fetch(prayer.id)
      await member.roles.remove(ROLE_ID!)

      await deletePrayer(prayer.id)
    } catch (error) {
      console.error(`Error while removing role/record about prayer "${prayer.id}":`)
      console.error(error)
    }
  }
}, 10_000)

// Реагируем на сообщения
client.on('messageCreate', async (message) => {
  // Не тот канал
  if (message.channelId !== CHANNEL_ID) {
    return
  }

  // Не сообщение с восхвалением
  if (!isPrayMessage(message.cleanContent)) {
    await message.delete()
    return
  }

  let prayer = await getPrayer(message.author.id)

  if (!prayer) {
    console.log(`${message.author.id} (${message.author.username}) is a new prayer!`)

    prayer = await createPrayer({
      id: message.author.id,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    // biome-ignore format: don't inline
    await Promise.all([
      message.react('🕯️'),
      message.member!.roles.add(ROLE_ID!)
    ])

    return
  }

  // Восхвалял совсем недавно, игнорируем
  if (!canPray(prayer)) {
    console.log(`${message.author.id} (${message.author.username}) has prayed, but too soon!`)
    await message.react('🕯️')
    return
  }

  // Принимаем восхваление
  console.log(`${message.author.id} (${message.author.username}) has prayed! Praying for you 🕯️ O Great Mita 💝`)
  await Promise.all([
    message.react('🕯️'),
    updatePrayer(prayer.id, {
      updatedAt: new Date()
    })
  ])
})

/**
 * Проверяет, является ли это сообщение восхвалением Миты
 */
function isPrayMessage(message: string): boolean {
  // Quick
  if (message === MESSAGE) {
    return true
  }

  // Deep
  const parts = message
    .trim()
    .split(' ')
    .map((x) => x)

  return MESSAGE_PARTS.every((x) => parts.includes(x))
}

/**
 * Проверяет, может ли человек восхвалить Миту
 */
function canPray(prayer: Prayer): boolean {
  return Date.now() - prayer.updatedAt.getTime() >= PRAY_MIN_INTERVAL
}

/**
 * Проверяет, восхвалял ли человек недавно Миту
 */
function hasPrayedRecently(prayer: Prayer): boolean {
  const now = Date.now()

  return now - prayer.updatedAt.getTime() <= PRAY_MAX_INTERVAL
}
