import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Rental } from './rental.entity';
import { Repository } from 'typeorm';
import { Car } from 'src/cars/car.entity';
import { access } from 'fs';

@Injectable()
export class RentalsService {
  constructor(
    @InjectRepository(Rental)
    private rentalsRepo: Repository<Rental>, // таблиця оренд
    @InjectRepository(Car)
    private carsRepo: Repository<Car>, // таблиця машин (щоб міняти статус)
  ) {}
  // POST /rentals - створити оренду
  async create(userId: number, carId: number, startDate: string, endDate: string) {
    const coche = await this.carsRepo.findOneBy({ id: carId });
    if (!coche) throw new NotFoundException('Coche no encontrado');

    if (coche.status === 'rented') {
      throw new BadRequestException('Coche ya está alquilado');
    }

    //рахує кільскість днів і остаточну ціну
    const start = new Date(startDate);
    const end = new Date(endDate);
    const dias = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    if (dias <= 0) throw new BadRequestException('Datos incorectos');
    const totalPrice = dias * Number(coche.pricePerDay);

    // Створює оренду в БД
    const rental = this.rentalsRepo.create({
      user: { id: userId }, //зв'язок з юзером і машиною
      car: { id: carId },
      startDate: start,
      endDate: end,
      totalPrice,
      status: 'active',
    });
    await this.rentalsRepo.update(carId, { status: 'rented' });
    return rental;
  }

  findAll() {
    return this.rentalsRepo.find({
      relations: ['user', 'car'],
    });
  }

  findByUser(userId: number) {
    return this.rentalsRepo.find({
      where: { user: { id: userId } },
      relations: ['car'],
    });
  }
  // PUT /rentals/:id/complete - завершити оренду
  async complete(id: number) {
    const rental = await this.rentalsRepo.findOne({
      where: { id },
      relations: ['car'],
    });
    if (!rental) throw new NotFoundException('No se encontró ningún alquiler');

    // Міняємо статус оренди
    await this.rentalsRepo.update(id, { status: 'completed' });

    // Повертаємо машину в доступні
    await this.carsRepo.update(rental.car.id, { status: 'available' });

    return { message: 'Оренду завершено' };
  }
}
