// src/modules/fruits/application/useCases/deleteFruit/deleteFruit.ts
import { UseCase } from '../../../../../shared/core/UseCase';
import { IFruitRepo } from '../../../infrastructure/repos/fruitRepo';
import { Result } from '../../../../../shared/domain/Result';
import { FruitName } from '../../../domain/fruitName';

interface DeleteFruitDTO {
  name: string;
  forceDelete: boolean;
}

export class DeleteFruitUseCase implements UseCase<DeleteFruitDTO, Promise<Result<void>>> {
  private fruitRepo: IFruitRepo;

  constructor(fruitRepo: IFruitRepo) {
    this.fruitRepo = fruitRepo;
  }

  async execute(request: DeleteFruitDTO): Promise<Result<void>> {
    try {
      const nameOrError = FruitName.create(request.name);
      if (nameOrError.isFailure) {
        return Result.fail<void>(nameOrError.error as string);
      }

      const fruit = await this.fruitRepo.findByName(nameOrError.getValue());
      if (!fruit) {
        return Result.fail<void>(`Fruit '${request.name}' not found`);
      }

      if (!request.forceDelete && !fruit.canBeDeleted()) {
        return Result.fail<void>(
          `Cannot delete fruit '${request.name}' as it has ${fruit.currentAmount.value} items in storage`
        );
      }

      fruit.markAsDeleted();
      await this.fruitRepo.delete(fruit);

      return Result.ok<void>();
    } catch (err) {
      return Result.fail<void>(`Unexpected error: ${err}`);
    }
  }
}