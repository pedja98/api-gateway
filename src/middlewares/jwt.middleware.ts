import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common'
import { NextFunction, Response } from 'express'
import * as jwt from 'jsonwebtoken'
import { JwtCustomRequest } from '../types/jwt.types'

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  use(req: JwtCustomRequest, res: Response, next: NextFunction) {
    if (req.originalUrl.includes('/auth/login')) {
      return next()
    }

    const authHeader = String(req.headers['Authorization'])
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      throw new UnauthorizedException('No token provided')
    }

    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] })
      next()
    } catch (err) {
      throw new UnauthorizedException('Invalid token')
    }
  }
}
