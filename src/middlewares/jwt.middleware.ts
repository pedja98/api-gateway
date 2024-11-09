import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common'
import { NextFunction, Response } from 'express'
import * as jwt from 'jsonwebtoken'
import { JwtCustomRequest } from '../types/jwt.types'
import { ConfigService } from '@nestjs/config'
import { RedisService } from '../redis/redis.service'

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  constructor(
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {}

  async use(req: JwtCustomRequest, res: Response, next: NextFunction) {
    try {
      const currentUser = String(req.headers['x-username'])
      const token = await this.redisService.get(currentUser)
      req.user = jwt.verify(token, this.configService.get<string>('auth.secret'))
      next()
    } catch (err) {
      throw new UnauthorizedException('Session invalid or expired')
    }
  }
}
