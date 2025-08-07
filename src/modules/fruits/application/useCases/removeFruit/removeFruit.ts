// src/modules/fruits/application/useCases/removeFruit/removeFruit.ts
import { UseCase } from '../../../../../shared/core/UseCase';
import { IFruitRepo } from '../../../infrastructure/repos/fruitRepo';
import { Result } from '../../../../../shared/domain/Result';
import { FruitName } from '../../../domain/fruitName';
import { FruitAmount } from '../../../domain/fruitAmount';

interface RemoveFruitDTO {
  name: string;
  amount: number;
}

export class RemoveFruitUseCase implements UseCase<RemoveFruitDTO, Promise<Result<void>>> {
  private fruitRepo: IFruitRepo;

  constructor(fruitRepo: IFruitRepo) {
    this.fruitRepo = fruitRepo;
  }

  async execute(request: RemoveFruitDTO): Promise<Result<void>> {
    try {
      const nameOrError = FruitName.create(request.name);
      if (nameOrError.isFailure) {
        return Result.fail<void>(nameOrError.error as string);
      }

      const amountOrError = FruitAmount.create(request.amount);
      if (amountOrError.isFailure) {
        return Result.fail<void>(amountOrError.error as string);
      }

      const fruit = await this.fruitRepo.findByName(nameOrError.getValue());
      if (!fruit) {
        return Result.fail<void>(`Fruit '${request.name}' not found`);
      }

      const removeResult = fruit.removeFruit(amountOrError.getValue());
      if (removeResult.isFailure) {
        return Result.fail<void>(removeResult.error as string);
      }

      await this.fruitRepo.save(fruit);

      return Result.ok<void>();
    } catch (err) {
      return Result.fail<void>(`Unexpected error: ${err}`);
    }
  }
}