import { registerAs } from '@nestjs/config'

export default registerAs('endpoint', () => ({
  crm: process.env.CRM_API,
  pc: process.env.PC_API,
  om: process.env.OM_API,
}))
