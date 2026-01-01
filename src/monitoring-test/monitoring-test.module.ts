import { Module } from '@nestjs/common';
import { MonitoringTestController } from './monitoring-test.controller';

@Module({
  controllers: [MonitoringTestController],
})
export class MonitoringTestModule {}

