import {
  Inject,
  Logger,
  MiddlewareConsumer,
  Module,
  NestModule,
} from '@nestjs/common';
import { UiController } from './ui.controller';
import { UiService } from './ui.service';
import { MessageQueueRepository } from './domain/repositories/message-queue.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageQueueEntity } from './entities/message-queue.entity';
import { MessageQueueService } from './domain/services/message-queue.service';
import { IMessageQueueService } from './domain/interfaces/imessage-queue-service.interface';
import { IRepository } from '@core/interface/repository/irespository.interface';
import { createBullBoard } from 'bull-board';
import { BullMQAdapter } from 'bull-board/BullMQAdapter';
import { Queue } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import { BullBoardController } from '../bullboard/bullboard.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      // Add all model you will use in your repository for this module
      MessageQueueEntity,
    ]),
  ],
  controllers: [UiController, BullBoardController],
  providers: [
    {
      provide: 'MessageQueueRepository',
      useClass: MessageQueueRepository,
      useExisting: IRepository,
    },
    {
      provide: 'MessageQueueService',
      useClass: MessageQueueService,
      useExisting: IMessageQueueService,
    },
    UiService,
  ],
})
export class UiModule implements NestModule {
  private readonly logger = new Logger('BullBoard');
  constructor(
    @Inject(ConfigService) private configService: ConfigService,
    @Inject('MessageQueueService')
    private messageService: IMessageQueueService,
  ) {}

  async configure(consumer: MiddlewareConsumer) {
    const connectionOpts = {
      host: this.configService.get('REDIS_HOST'),
      port: this.configService.get('REDIS_PORT'),
    };

    this.logger.debug('REDIS CONNECTION', connectionOpts);

    const DBqueueNames = (await this.messageService.getQueueNames()).map(
      (queue) => queue.name,
    );

    this.logger.debug('DBqueueNames', DBqueueNames);

    const bullAdapters = DBqueueNames.map(
      (queueName) =>
        new BullMQAdapter(
          new Queue(queueName, {
            connection: connectionOpts,
          }),
        ),
    );

    const { router } = createBullBoard(bullAdapters);

    consumer.apply(router).forRoutes('dashboard');
  }
}
