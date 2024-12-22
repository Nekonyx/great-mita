declare namespace NodeJS {
  interface ProcessEnv {
    DB_URL: string
    TOKEN: string
    GUILD_ID: string
    CHANNEL_ID: string
    ROLE_ID: string
  }
}
