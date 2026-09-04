import { Module } from '@nestjs/common';
import { ResultadosController } from './resultados.controller';
import { ResultadosService } from './resultados.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [ResultadosController],
  providers: [ResultadosService],
})
export class ResultadosModule {}
