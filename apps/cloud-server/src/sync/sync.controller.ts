import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { SyncService } from './sync.service';
import { SyncPushDto, SyncPullDto } from './dto/sync-payload.dto';

@Controller('sync')
export class SyncController {
    constructor(private readonly syncService: SyncService) { }

    @Post('push')
    push(@Body() body: SyncPushDto) {
        return this.syncService.push(body);
    }

    @Get('pull')
    pull(@Query() query: SyncPullDto) {
        return this.syncService.pull(query);
    }
}
