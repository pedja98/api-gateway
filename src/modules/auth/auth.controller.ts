import { Body, Controller, HttpStatus, Logger, Post, Req, Res } from '@nestjs/common'
import { Request, Response } from 'express'
import { AuthService } from './auth.service'
import { AuthLogoutDto } from './dtos/auth-logout.dto'

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name)

  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Req() req: Request, @Res() res: Response) {
    try {
      const { data, status } = await this.authService.login(req)
      return res.status(status).json(data)
    } catch (error) {
      return res.status(error.response?.status || 500).json({
        message: 'Auth failed',
        error: error.response?.data || error.message,
      })
    }
  }

  @Post('logout')
  async logout(@Body() authLogout: AuthLogoutDto, @Res() res: Response) {
    try {
      await this.authService.logout(authLogout)
      return res.status(HttpStatus.OK).json({ message: 'logoutSuccessfully' })
    } catch (error) {
      return res.status(error.response?.status || 500).json({
        message: 'Logout failed',
        error: error.response?.data || error.message,
      })
    }
  }
}
