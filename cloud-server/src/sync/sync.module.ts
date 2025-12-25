import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SyncController } from './sync.controller';
import { SyncService } from './sync.service';

@Module({
    imports: [TypeOrmModule],
    controllers: [SyncController],
    providers: [SyncService],
})
export class SyncModule { }
