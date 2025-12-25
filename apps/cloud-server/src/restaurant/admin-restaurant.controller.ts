import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { RestaurantService } from './restaurant.service';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';

@Controller('admin/restaurants')
export class AdminRestaurantController {
    constructor(private readonly restaurantService: RestaurantService) { }

    @Post()
    async create(@Body() createRestaurantDto: CreateRestaurantDto) {
        return await this.restaurantService.create(createRestaurantDto);
    }

    @Get()
    async findAll() {
        return await this.restaurantService.findAll();
    }
}
