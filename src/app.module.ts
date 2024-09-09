import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ProxyModule } from './proxy/proxy.module'
import endpointConfig from './configs/endpoint.config'
import authConfig from './configs/auth.config'
import { JwtMiddleware } from './middlewares/jwt.middleware'
import { AuthModule } from './auth/auth.module'
import { GlobalModule } from './global/global.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [endpointConfig, authConfig],
    }),
    ProxyModule,
    AuthModule,
    GlobalModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtMiddleware).exclude({ path: '/auth/*', method: RequestMethod.ALL }).forRoutes('*')
  }
}
