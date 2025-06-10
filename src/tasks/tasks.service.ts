import { Injectable, Logger } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { HttpService } from '@nestjs/axios'
import { ConfigService } from '@nestjs/config'
import { lastValueFrom } from 'rxjs'

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name)

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  @Cron('0 1 * * *')
  async handleDeactivateExpiredAddons() {
    const pcApi = this.configService.get<string>('endpoint.pc')
    const url = `${pcApi}/addons/deactivate-expired`

    try {
      const response = await lastValueFrom(this.httpService.put(url))
      this.logger.log(`Deactivation triggered successfully. Status: ${response.status}`)
    } catch (error) {
      this.logger.error('Failed to deactivate expired addons', error)
    }
  }
}
