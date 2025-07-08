import { registerAs } from '@nestjs/config'

export default registerAs('auth', () => ({
  secret: process.env.JWT_SECRET,
  hashingSecret: process.env.HASHING_SECRET_KEY,
}))
