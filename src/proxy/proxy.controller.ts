import { Controller, All, Req, Res, HttpStatus, HttpException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Request, Response } from 'express'
import { HttpService } from '@nestjs/axios'
import { lastValueFrom } from 'rxjs'

@Controller({ path: 'proxy*' })
export class ProxyController {
  private systemUrls: { [key: string]: string }

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
      // Resolve the target URL based on the incoming request
      const url = this.resolveUrl(req.url)
      if (!url) {
        throw new HttpException('Service not found', HttpStatus.NOT_FOUND)
      }

      const response = await lastValueFrom(
        this.httpService.request({
          url,
          method: req.method,
          headers: {
            ...req.headers,
            Authorization: req.headers.authorization || '',
          },
          data: req.body,
        }),
      )

      res.status(response.status).send(response.data)
    } catch (error) {
      const status = error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR
      const message = error.response?.data || 'Internal server error'
      res.status(status).send(message)
    }
  }

  private resolveUrl(originalUrl: string): string | null {
    const prefix = '/proxy/'
    const urlWithoutPrefix = originalUrl.replace(prefix, '')
    const [systemKey, ...restOfUrl] = urlWithoutPrefix.split('/')

    const baseUrl = this.systemUrls[systemKey]
    if (!baseUrl) {
      return null
    }

    return `${baseUrl}/${restOfUrl.join('/')}`
  }
}
