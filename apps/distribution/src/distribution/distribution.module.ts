import { Module } from '@nestjs/common';
import { DistributionController } from './controllers/distribution.controller';
import { DistributionProvider } from './providers/distribution.provider';

@Module({
  controllers: [DistributionController],
  providers: [DistributionProvider],
})
export class DistributionModule {}
