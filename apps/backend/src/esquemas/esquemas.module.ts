import { Module } from '@nestjs/common';
import { EsquemasService } from './esquemas.service';
import { EsquemasController } from './esquemas.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [EsquemasController],
  providers: [EsquemasService],
})
export class EsquemasModule {}
