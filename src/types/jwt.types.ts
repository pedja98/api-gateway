import { Request } from 'express'

export interface JwtCustomRequest extends Request {
  user?: any
}
