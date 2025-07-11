import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Glimpse, GlimpseEntity } from './entities/glimpse.entity';
import { GlimpsesService } from './glimpses.service';
import { GlimpsesResolver } from './glimpses.resolver';
import { GlimpsesRepository } from './glimpses.repository';


@Module({
  imports: [
    MongooseModule.forFeature([{ name: Glimpse.name, schema: GlimpseEntity }]),
  ],
  providers: [GlimpsesResolver, GlimpsesService, GlimpsesRepository],
  exports: [MongooseModule, GlimpsesService]
})
export class GlimpsesModule { } 