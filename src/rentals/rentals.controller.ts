import { Controller, Get, Post, Put, Body, Param } from '@nestjs/common';
import { RentalsService } from './rentals.service';

@Controller('rentals')
export class RentalsController {
  constructor(private rentalsService: RentalsService) {}

  @Post()
  create(@Body() body: { userId: number; carId: number; startDate: string; endDate: string }) {
    return this.rentalsService.create(body.userId, body.carId, body.startDate, body.endDate);
  }

  @Get()
  findAll() {
    return this.rentalsService.findAll();
  }

  @Get('my/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.rentalsService.findByUser(+userId);
  }

  @Put(':id/complete')
  complete(@Param('id') id: string) {
    return this.rentalsService.complete(+id);
  }
}
