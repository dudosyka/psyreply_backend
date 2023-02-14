import { Module } from '@nestjs/common';
import { BlockController } from './controllers/block.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { BlockModel } from './models/block.model';
import { BlockProvider } from './providers/block.provider';
import { TestBlockModule } from '../test-block/test-block.module';
import { AuthProvider } from '@app/application/modules/auth/providers/auth.provider';
import { AuthModule } from '@app/application/modules/auth/auth.module';

@Module({
  imports: [
    SequelizeModule.forFeature([BlockModel]),
    TestBlockModule,
    AuthModule,
  ],
  controllers: [BlockController],
  providers: [BlockProvider, AuthProvider],
  exports: [
    TestBlockModule,
    BlockProvider,
    SequelizeModule.forFeature([BlockModel]),
    AuthProvider,
  ],
})
export class BlockModule {}
