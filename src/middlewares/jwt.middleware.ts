import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common'
import { NextFunction, Response } from 'express'
import * as jwt from 'jsonwebtoken'
import { JwtCustomRequest } from '../types/jwt.types'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  constructor(private readonly configService: ConfigService) {}

  use(req: JwtCustomRequest, res: Response, next: NextFunction) {
    if (req.originalUrl.includes('/auth/login')) {
      return next()
    }

    const authHeader = String(req.headers['authorization'])
    console.log(req.headers)
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      throw new UnauthorizedException('No token provided')
    }

    try {
      req.user = jwt.verify(token, this.configService.get<string>('auth.secret'))
      next()
    } catch (err) {
      throw new UnauthorizedException('Invalid token')
    }
  }
}
