import { Body, Controller, Logger, Post, Res } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { HttpService } from '@nestjs/axios'
import { Request, Response } from 'express'
import { lastValueFrom } from 'rxjs'
import { AuthLoginDto } from './auth.dtos'

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name)
  private crmLoginUrl
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.crmLoginUrl = this.configService.get<string>('endpoint.crm') + '/auth/login'
  }

  @Post('login')
  async login(@Body() authLogin: AuthLoginDto, @Res() res: Response) {
    try {
      const response = await lastValueFrom(this.httpService.post(this.crmLoginUrl, authLogin))
      return res.status(response.status).json(response.data)
    } catch (error) {
      this.logger.error('Error logging in:', error.message)
      return res.status(error.response?.status || 500).json({
        message: 'Failed to login to CRM',
        error: error.response?.data || error.message,
      })
    }
  }
}
