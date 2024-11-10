import { registerAs } from '@nestjs/config'

export default registerAs('redis', () => ({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  ttl: process.env.REDIS_TTL,
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_USER_PASSWORD,
}))
