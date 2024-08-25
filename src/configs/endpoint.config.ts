import { registerAs } from '@nestjs/config'

export default registerAs('endpoint', () => ({
  crm: process.env.CRM_API,
}))
