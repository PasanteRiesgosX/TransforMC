import { Module } from '@nestjs/common';
import { CertificacionesController } from './certificaciones.controller';
import { CertificacionesService } from './certificaciones.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [CertificacionesController],
  providers: [CertificacionesService],
})
export class CertificacionesModule {}
