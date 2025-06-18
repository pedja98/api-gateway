import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { HttpService } from '@nestjs/axios'
import { Request } from 'express'
import { lastValueFrom } from 'rxjs'

@Injectable()
export class ProxyService {
  private readonly systemUrls: Record<string, string>
  private readonly logger = new Logger(ProxyService.name)

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.systemUrls = {
      crm: this.configService.get<string>('endpoint.crm'),
      pc: this.configService.get<string>('endpoint.pc'),
      om: this.configService.get<string>('endpoint.om'),
    }
  }

  async forwardRequest(req: Request, forceUrl?: string, overrideBody?: any): Promise<{ status: number; data: any }> {
    const resolvedUrl = forceUrl || this.resolveUrl(req.url)

    if (!resolvedUrl) {
      throw new HttpException('Service not found', HttpStatus.NOT_FOUND)
    }

    const headers = { ...req.headers }
    delete headers['content-length']
    delete headers['Content-Length']

    try {
      const proxiedResponse = await lastValueFrom(
        this.httpService.request({
          url: resolvedUrl,
          method: req.method,
          data: overrideBody || req.body,
          headers,
        }),
      )

      return {
        status: proxiedResponse.status,
        data: proxiedResponse.data,
      }
    } catch (error) {
      this.logger.error('Error during request forwarding:', {
        url: resolvedUrl,
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      })

      throw new HttpException(
        error.response?.data || 'Internal server error',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

  private resolveUrl(originalUrl: string): string | null {
    const prefix = '/api/v1/proxy/'
    const urlWithoutPrefix = originalUrl.replace(prefix, '')
    const [systemKey, ...restPath] = urlWithoutPrefix.split('/')

    const baseUrl = this.systemUrls[systemKey]
    if (!baseUrl) {
      return null
    }

    return `${baseUrl}/${restPath.join('/')}`
  }
}
