// src/modules/fruits/infrastructure/repos/fruitRepo.ts
import { Fruit } from '../../domain/fruit';
import { FruitName } from '../../domain/fruitName';

export interface IFruitRepo {
  exists(name: FruitName): Promise<boolean>;
  findByName(name: FruitName): Promise<Fruit | null>;
  save(fruit: Fruit): Promise<void>;
  delete(fruit: Fruit): Promise<void>;
}