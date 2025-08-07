// src/modules/fruits/infrastructure/repos/implementations/mongoFruitRepo.ts
import { IFruitRepo } from '../fruitRepo';
import { Fruit } from '../../../domain/fruit';
import { FruitName } from '../../../domain/fruitName';
// import { FruitModel } from '../../models/fruitModel';
import { FruitMapper } from '../../mappers/fruitMapper';
import { DomainEvents } from '../../../../../shared/domain/DomainEvents';

export class MongoFruitRepo implements IFruitRepo {
  private models: any;

  constructor(models: any) {
    this.models = models;
  }

  async exists(name: FruitName): Promise<boolean> {
    const fruitDocument = await this.models.Fruit
      .findOne({ name: name.value })
      .lean()
      .exec();
    return !!fruitDocument;
  }

  async findByName(name: FruitName): Promise<Fruit | null> {
    const fruitDocument = await this.models.Fruit
      .findOne({ name: name.value })
      .lean()
      .exec();
    
    if (!fruitDocument) return null;
    
    return FruitMapper.toDomain(fruitDocument);
  }

  async save(fruit: Fruit): Promise<void> {
    const raw = await FruitMapper.toPersistence(fruit);
    
    await this.models.Fruit.findOneAndUpdate(
      { fruitId: raw.fruitId },
      raw,
      { upsert: true, new: true }
    ).exec();

    await DomainEvents.dispatchEventsForAggregate(fruit.id);
  }

  async delete(fruit: Fruit): Promise<void> {
    await this.models.Fruit.deleteOne({ 
      fruitId: fruit.fruitId.toString() 
    }).exec();

    await DomainEvents.dispatchEventsForAggregate(fruit.id);
  }
}