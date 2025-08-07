// src/modules/fruits/domain/services/fruitUniquenessChecker.ts
import { FruitName } from '../fruitName';

export interface IFruitUniquenessChecker {
  isUnique(name: FruitName): Promise<boolean>;
}

export class FruitUniquenessChecker implements IFruitUniquenessChecker {
  constructor(private fruitRepo: any) {}

  async isUnique(name: FruitName): Promise<boolean> {
    const existingFruit = await this.fruitRepo.findByName(name);
    return !existingFruit;
  }
}