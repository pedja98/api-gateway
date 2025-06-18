import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as jwt from 'jsonwebtoken'
import { RedisService } from '../redis/redis.service'
import { ProxyService } from '../proxy/proxy.service'
import { Request } from 'express'
import { AuthLogoutDto } from './dtos/auth-logout.dto'

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)
  private readonly crmLoginUrl: string

  constructor(
    private readonly configService: ConfigService,
    private readonly proxyService: ProxyService,
    private readonly redisService: RedisService,
  ) {
    this.crmLoginUrl = this.configService.get<string>('endpoint.crm') + '/auth/login'
  }

  async login(authLoginReq: Request) {
    try {
      const response = await this.proxyService.forwardRequest(authLoginReq, this.crmLoginUrl)
      const token = jwt.sign({ username: response.data.username }, this.configService.get<string>('auth.secret'))
      await this.redisService.set(response.data.username, token, this.redisService.getTimeToLive())
      return { data: response.data, status: response.status }
    } catch (error) {
      this.logger.error('Error logging in:', error.message)
      throw error
    }
  }

  async logout(authLogout: AuthLogoutDto) {
    try {
      await this.redisService.del(authLogout.username)
    } catch (error) {
      this.logger.error('Error logging out:', error.message)
      throw error
    }
  }
}
