// src/modules/fruits/application/useCases/findFruit/findFruit.ts
import { UseCase } from '../../../../../shared/core/UseCase';
import { IFruitRepo } from '../../../infrastructure/repos/fruitRepo';
import { Result } from '../../../../../shared/domain/Result';
import { FruitName } from '../../../domain/fruitName';
import { Fruit } from '../../../domain/fruit';

interface FindFruitDTO {
  name: string;
}

interface FruitResponseDTO {
  name: string;
  description: string;
  limitOfFruitToBeStored: number;
  currentAmount: number;
}

export class FindFruitUseCase implements UseCase<FindFruitDTO, Promise<Result<FruitResponseDTO>>> {
  private fruitRepo: IFruitRepo;

  constructor(fruitRepo: IFruitRepo) {
    this.fruitRepo = fruitRepo;
  }

  async execute(request: FindFruitDTO): Promise<Result<FruitResponseDTO>> {
    try {
      const nameOrError = FruitName.create(request.name);
      if (nameOrError.isFailure) {
        return Result.fail<FruitResponseDTO>(nameOrError.error as string);
      }

      const fruit = await this.fruitRepo.findByName(nameOrError.getValue());
      if (!fruit) {
        return Result.fail<FruitResponseDTO>(`Fruit '${request.name}' not found`);
      }

      return Result.ok<FruitResponseDTO>({
        name: fruit.name.value,
        description: fruit.description.value,
        limitOfFruitToBeStored: fruit.limitOfFruitToBeStored.value,
        currentAmount: fruit.currentAmount.value
      });
    } catch (err) {
      return Result.fail<FruitResponseDTO>(`Unexpected error: ${err}`);
    }
  }
}