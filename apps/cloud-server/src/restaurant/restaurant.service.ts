import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Restaurant } from './entities/restaurant.entity';
import * as crypto from 'crypto';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';

@Injectable()
export class RestaurantService {
    constructor(
        @InjectRepository(Restaurant)
        private restaurantRepository: Repository<Restaurant>,
    ) { }

    async create(createRestaurantDto: CreateRestaurantDto) {
        const restaurant = this.restaurantRepository.create({
            id: crypto.randomUUID(),
            accessKey: crypto.randomBytes(16).toString('hex'), // Secure random key
            ...createRestaurantDto
        });
        return await this.restaurantRepository.save(restaurant);
    }

    async findAll() {
        return await this.restaurantRepository.find({
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: string) {
        const restaurant = await this.restaurantRepository.findOne({ where: { id } });
        if (!restaurant) {
            throw new NotFoundException(`Restaurant with ID ${id} not found`);
        }
        return restaurant;
    }

    async verify(id: string, accessKey: string) {
        const restaurant = await this.restaurantRepository.findOne({ where: { id, accessKey } });
        if (!restaurant) {
            throw new NotFoundException('Invalid credentials');
        }
        return { valid: true, restaurant };
    }
}
