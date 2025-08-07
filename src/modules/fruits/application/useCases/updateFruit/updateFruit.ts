// src/modules/fruits/application/useCases/updateFruit/updateFruit.ts
import { UseCase } from '../../../../../shared/core/UseCase';
import { IFruitRepo } from '../../../infrastructure/repos/fruitRepo';
import { Result } from '../../../../../shared/domain/Result';
import { FruitName } from '../../../domain/fruitName';
import { FruitDescription } from '../../../domain/fruitDescription';
import { FruitLimit } from '../../../domain/fruitLimit';

interface UpdateFruitDTO {
  name: string;
  description: string;
  limitOfFruitToBeStored: number;
}

export class UpdateFruitUseCase implements UseCase<UpdateFruitDTO, Promise<Result<void>>> {
  private fruitRepo: IFruitRepo;

  constructor(fruitRepo: IFruitRepo) {
    this.fruitRepo = fruitRepo;
  }

  async execute(request: UpdateFruitDTO): Promise<Result<void>> {
    try {
      const nameOrError = FruitName.create(request.name);
      if (nameOrError.isFailure) {
        return Result.fail<void>(nameOrError.error as string);
      }

      const fruit = await this.fruitRepo.findByName(nameOrError.getValue());
      if (!fruit) {
        return Result.fail<void>(`Fruit '${request.name}' not found`);
      }

      const descriptionOrError = FruitDescription.create(request.description);
      if (descriptionOrError.isFailure) {
        return Result.fail<void>(descriptionOrError.error as string);
      }

      const limitOrError = FruitLimit.create(request.limitOfFruitToBeStored);
      if (limitOrError.isFailure) {
        return Result.fail<void>(limitOrError.error as string);
      }

      const updateResult = fruit.updateDetails(
        descriptionOrError.getValue(),
        limitOrError.getValue()
      );

      if (updateResult.isFailure) {
        return Result.fail<void>(updateResult.error as string);
      }

      await this.fruitRepo.save(fruit);

      return Result.ok<void>();
    } catch (err) {
      return Result.fail<void>(`Unexpected error: ${err}`);
    }
  }
}