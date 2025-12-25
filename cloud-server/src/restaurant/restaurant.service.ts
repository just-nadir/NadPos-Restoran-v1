import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Restaurant } from './entities/restaurant.entity';

@Injectable()
export class RestaurantService {
    constructor(
        @InjectRepository(Restaurant)
        private restaurantRepository: Repository<Restaurant>,
    ) { }

    async create(data: { id: string; name: string; licenseKey: string }) {
        const restaurant = this.restaurantRepository.create(data);
        return await this.restaurantRepository.save(restaurant);
    }

    async findAll() {
        return await this.restaurantRepository.find({
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: string) {
        return await this.restaurantRepository.findOne({ where: { id } });
    }
}
