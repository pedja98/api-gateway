import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as jwt from 'jsonwebtoken'
import * as CryptoJS from 'crypto-js'
import { RedisService } from '../../redis/redis.service'
import { ProxyService } from '../proxy/proxy.service'
import { Request } from 'express'
import { AuthLogoutDto } from './dtos/auth-logout.dto'

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)
  private readonly crmLoginUrl: string
  private readonly crmChangePasswordUrl: string

  constructor(
    private readonly configService: ConfigService,
    private readonly proxyService: ProxyService,
    private readonly redisService: RedisService,
  ) {
    this.crmLoginUrl = this.configService.get<string>('endpoint.crm') + '/auth/login'
    this.crmChangePasswordUrl = this.configService.get<string>('endpoint.crm') + '/auth/login'
  }

  async login(authLoginReq: Request) {
    try {
      const decryptedPassword = CryptoJS.AES.decrypt(
        authLoginReq.body.password,
        this.configService.get<string>('auth.hashingSecret'),
      ).toString(CryptoJS.enc.Utf8)
      const response = await this.proxyService.forwardRequest(authLoginReq, this.crmLoginUrl, {
        username: authLoginReq.body.username,
        password: decryptedPassword,
      })
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

  async changePassword(request: Request) {
    try {
      const decryptedOldPassword = CryptoJS.AES.decrypt(
        request.body.oldPassword,
        this.configService.get<string>('auth.hashingSecret'),
      ).toString(CryptoJS.enc.Utf8)

      const decryptedNewPassword = CryptoJS.AES.decrypt(
        request.body.newPassword,
        this.configService.get<string>('auth.hashingSecret'),
      ).toString(CryptoJS.enc.Utf8)
      const response = await this.proxyService.forwardRequest(request, this.crmChangePasswordUrl, {
        oldPassword: decryptedOldPassword,
        newPassword: decryptedNewPassword,
        username: request.body.username,
      })
      return { data: response.data, status: response.status }
    } catch (error) {
      this.logger.error('Error logging out:', error.message)
      throw error
    }
  }
}
