import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ProxyModule } from './proxy/proxy.module'
import endpointConfig from './configs/endpoint.config'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [endpointConfig],
    }),
    ProxyModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
