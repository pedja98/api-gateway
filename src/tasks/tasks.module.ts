import { Module } from '@nestjs/common'
import { TasksService } from './tasks.service'
import { HttpModule } from '@nestjs/axios'

@Module({
  imports: [HttpModule],
  providers: [TasksService],
})
export class TasksModule {}
