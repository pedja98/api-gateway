import { All, Controller, HttpException, HttpStatus, Logger, Req, Res, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Request, Response } from 'express'
import { HttpService } from '@nestjs/axios'
import { lastValueFrom } from 'rxjs'

@Controller({ path: 'proxy*' })
export class ProxyController {
  private systemUrls: { [key: string]: string }
  private readonly logger = new Logger(ProxyController.name)

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.systemUrls = {
      crm: this.configService.get<string>('endpoint.crm'),
    }
  }

  @All('/*')
  async proxyRequest(@Req() req: Request, @Res() res: Response) {
    try {
      this.logger.log('Incoming Request:', {
        method: req.method,
        url: req.url,
        headers: req.headers,
        body: req.body,
      })

      const url = this.resolveUrl(req.url)
      if (!url) {
        throw new HttpException('Service not found', HttpStatus.NOT_FOUND)
      }

      this.logger.log('Proxying Request to:', url)

      const response = await lastValueFrom(
        this.httpService.request({
          url,
          method: req.method,
          data: req.body,
        }),
      )

      this.logger.log(
        `Response from proxied service: ${JSON.stringify({
          status: response.status,
          data: response.data,
        })}`,
      )

      res.status(response.status).send(response.data)
    } catch (error) {
      this.logger.error(
        `Error during proxying request: ${JSON.stringify({
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        })}`,
      )

      const status = error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR
      const message = error.response?.data || 'Internal server error'
      res.status(status).send(message)
    }
  }

  private resolveUrl(originalUrl: string): string | null {
    const prefix = '/api/v1/proxy/'
    const urlWithoutPrefix = originalUrl.replace(prefix, '')
    const [systemKey, ...restOfUrl] = urlWithoutPrefix.split('/')

    const baseUrl = this.systemUrls[systemKey]
    if (!baseUrl) {
      return null
    }

    return `${baseUrl}/${restOfUrl.join('/')}`
  }
}
