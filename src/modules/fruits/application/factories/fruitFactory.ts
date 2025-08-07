// src/modules/fruits/application/factories/fruitFactory.ts
import { Result } from '../../../../shared/domain/Result';
import { Fruit } from '../../domain/fruit';
import { FruitName } from '../../domain/fruitName';
import { FruitDescription } from '../../domain/fruitDescription';
import { FruitLimit } from '../../domain/fruitLimit';
import { FruitAmount } from '../../domain/fruitAmount';
import { UniqueEntityID } from '../../../../shared/domain/UniqueEntityID';

export interface CreateFruitDTO {
  name: string;
  description: string;
  limitOfFruitToBeStored: number;
}

export class FruitFactory {
  public static create(dto: CreateFruitDTO, id?: UniqueEntityID): Result<Fruit> {
    const nameOrError = FruitName.create(dto.name);
    const descriptionOrError = FruitDescription.create(dto.description);
    const limitOrError = FruitLimit.create(dto.limitOfFruitToBeStored);
    const initialAmount = FruitAmount.create(0);

    const combinedResult = Result.combine([
      nameOrError,
      descriptionOrError,
      limitOrError,
      initialAmount
    ]);

    if (combinedResult.isFailure) {
      return Result.fail<Fruit>(combinedResult.error as string);
    }

    const fruit = Fruit.create({
      name: nameOrError.getValue(),
      description: descriptionOrError.getValue(),
      limitOfFruitToBeStored: limitOrError.getValue(),
      currentAmount: initialAmount.getValue()
    }, id);

    return fruit;
  }
}