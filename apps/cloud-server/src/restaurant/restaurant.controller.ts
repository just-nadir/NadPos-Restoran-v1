import { Controller, Get, Post, Body } from '@nestjs/common';
import { RestaurantService } from './restaurant.service';

@Controller('restaurants')
export class RestaurantController {
    constructor(private readonly restaurantService: RestaurantService) { }

    @Post()
    async create(@Body() body: { id: string; name: string }) {
        return await this.restaurantService.create(body);
    }

    @Get()
    async findAll() {
        return await this.restaurantService.findAll();
    }
}
