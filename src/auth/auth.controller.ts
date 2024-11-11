import { Body, Controller, HttpStatus, Logger, Post, Res } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { HttpService } from '@nestjs/axios'
import { Response } from 'express'
import { lastValueFrom } from 'rxjs'
import { AuthLoginRequestDto, AuthLogoutDto } from './auth.dtos'
import * as jwt from 'jsonwebtoken'
import { RedisService } from '../redis/redis.service'

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name)
  private readonly crmLoginUrl: string

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly redisService: RedisService,
  ) {
    this.crmLoginUrl = this.configService.get<string>('endpoint.crm') + '/auth/login'
  }

  @Post('login')
  async login(@Body() authLoginReq: AuthLoginRequestDto, @Res() res: Response) {
    try {
      const response = await lastValueFrom(this.httpService.post(this.crmLoginUrl, authLoginReq))
      const token = jwt.sign({ ...response.data }, this.configService.get<string>('auth.secret'))
      await this.redisService.set(response.data.username, token, this.redisService.getTimeToLive())
      return res.status(response.status).json(response.data)
    } catch (error) {
      this.logger.error('Error logging in:', error.message)
      return res.status(error.response?.status || 500).json({
        message: 'Auth failed',
        error: error.response?.data || error.message,
      })
    }
  }

  @Post('logout')
  async logout(@Body() authLogout: AuthLogoutDto, @Res() res: Response) {
    try {
      await this.redisService.del(authLogout.username)
      return res.status(HttpStatus.OK).json({
        message: 'logoutSuccessfully',
      })
    } catch (error) {
      this.logger.error('Error logging out:', error.message)
      return res.status(error.response?.status || 500).json({
        message: 'Logout failed',
        error: error.response?.data || error.message,
      })
    }
  }
}
