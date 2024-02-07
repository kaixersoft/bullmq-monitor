import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfig } from './core/config/typeorm.config';
import { UiModule } from './ui/ui.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({ useClass: TypeOrmConfig }),
    // Register your feature module here
    UiModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
