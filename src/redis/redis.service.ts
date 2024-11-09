import { Injectable } from '@nestjs/common'
import { Redis } from 'ioredis'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class RedisService {
  private redis: Redis

  private timeToLive: number

  constructor(private readonly configService: ConfigService) {
    this.redis = new Redis({
      host: this.configService.get<string>('redis.host'),
      port: this.configService.get<number>('redis.port'),
    })
    this.timeToLive = Number(this.configService.get<number>('redis.ttl'))
  }

  public getTimeToLive(): number {
    return this.timeToLive
  }

  async set(key: string, value: string, expiration?: number) {
    if (expiration) {
      await this.redis.set(key, value, 'EX', expiration)
    } else {
      await this.redis.set(key, value)
    }
  }

  async get(key: string): Promise<string | null> {
    return await this.redis.get(key)
  }

  async del(key: string) {
    await this.redis.del(key)
  }

  async quit() {
    await this.redis.quit()
  }
}
