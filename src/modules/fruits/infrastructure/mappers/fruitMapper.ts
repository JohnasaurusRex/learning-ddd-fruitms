// src/modules/fruits/infrastructure/mappers/fruitMapper.ts
import { Fruit } from '../../domain/fruit';
import { FruitName } from '../../domain/fruitName';
import { FruitDescription } from '../../domain/fruitDescription';
import { FruitLimit } from '../../domain/fruitLimit';
import { FruitAmount } from '../../domain/fruitAmount';
import { UniqueEntityID } from '../../../../shared/domain/UniqueEntityID';

export class FruitMapper {
  public static toDomain(raw: any): Fruit | null {
    const nameOrError = FruitName.create(raw.name);
    const descriptionOrError = FruitDescription.create(raw.description);
    const limitOrError = FruitLimit.create(raw.limitOfFruitToBeStored);
    const amountOrError = FruitAmount.create(raw.currentAmount);

    const fruitOrError = Fruit.create({
      name: nameOrError.getValue(),
      description: descriptionOrError.getValue(),
      limitOfFruitToBeStored: limitOrError.getValue(),
      currentAmount: amountOrError.getValue()
    }, new UniqueEntityID(raw.fruitId));

    return fruitOrError.isSuccess ? fruitOrError.getValue() : null;
  }

  public static async toPersistence(fruit: Fruit): Promise<any> {
    return {
      fruitId: fruit.fruitId.toString(),
      name: fruit.name.value,
      description: fruit.description.value,
      limitOfFruitToBeStored: fruit.limitOfFruitToBeStored.value,
      currentAmount: fruit.currentAmount.value
    };
  }
}