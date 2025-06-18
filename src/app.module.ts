import endpointConfig from './configs/endpoint.config'
import authConfig from './configs/auth.config'
import redisConfig from './configs/redis.config'
import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ProxyModule } from './modules/proxy/proxy.module'
import { JwtMiddleware } from './middlewares/jwt.middleware'
import { AuthModule } from './modules/auth/auth.module'
import { GlobalModule } from './global/global.module'
import { RedisModule } from './redis/redis.module'
import { HeadersValidateMiddleware } from './middlewares/headers-validate.middleware'
import { ScheduleModule } from '@nestjs/schedule'
import { TasksService } from './tasks/tasks.service'
import { TasksModule } from './tasks/tasks.module'
import { OffersModule } from './modules/offers/offers.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [endpointConfig, authConfig, redisConfig],
    }),
    ScheduleModule.forRoot(),
    ProxyModule,
    AuthModule,
    GlobalModule,
    RedisModule.register(),
    TasksModule,
    OffersModule,
  ],
  controllers: [],
  providers: [TasksService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(HeadersValidateMiddleware)
      .exclude({ path: '/auth/login', method: RequestMethod.POST })
      .forRoutes('*')
    consumer.apply(JwtMiddleware).exclude({ path: '/auth/login', method: RequestMethod.POST }).forRoutes('*')
  }
}
