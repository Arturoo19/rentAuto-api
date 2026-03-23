import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Car } from './car.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CarsService {
  constructor(
    @InjectRepository(Car)
    private carsRepo: Repository<Car>,
  ) {}

  findAll() {
    return this.carsRepo.find();
  }

  async findOne(id: number) {
    const car = await this.carsRepo.findOneBy({ id });
    if (!car) throw new NotFoundException('Coche no encontrado');
    return car;
  }

  create(dto: Partial<Car>) {
    const car = this.carsRepo.create(dto);
    return this.carsRepo.save(car);
  }

  async update(id: number, dto: Partial<Car>) {
    await this.findOne(id);
    await this.carsRepo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.carsRepo.delete(id);
    return { message: 'Coche eliminado' };
  }
}
