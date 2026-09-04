import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ModulosModule } from './modulos/modulos.module';
import { EsquemasModule } from './esquemas/esquemas.module';
import { ResultadosModule } from './resultados/resultados.module';
import { CertificacionesModule } from './certificaciones/certificaciones.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ModulosModule,
    EsquemasModule,
    ResultadosModule,
    CertificacionesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
