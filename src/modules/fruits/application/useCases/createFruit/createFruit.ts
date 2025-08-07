// src/modules/fruits/application/useCases/createFruit/createFruit.ts
import { UseCase } from '../../../../../shared/core/UseCase';
import { IFruitRepo } from '../../../infrastructure/repos/fruitRepo';
import { CreateFruitDTO, FruitFactory } from '../../factories/fruitFactory';
import { FruitUniquenessChecker } from '../../../domain/services/fruitUniquenessChecker';
import { Result } from '../../../../../shared/domain/Result';
import { FruitName } from '../../../domain/fruitName';

export class CreateFruitUseCase implements UseCase<CreateFruitDTO, Promise<Result<void>>> {
  private fruitRepo: IFruitRepo;
  private uniquenessChecker: FruitUniquenessChecker;

  constructor(fruitRepo: IFruitRepo) {
    this.fruitRepo = fruitRepo;
    this.uniquenessChecker = new FruitUniquenessChecker(fruitRepo);
  }

  async execute(request: CreateFruitDTO): Promise<Result<void>> {
    try {
      // Create fruit name value object to check uniqueness
      const nameOrError = FruitName.create(request.name);
      if (nameOrError.isFailure) {
        return Result.fail<void>(nameOrError.error as string);
      }

      // Check uniqueness using domain service
      const isUnique = await this.uniquenessChecker.isUnique(nameOrError.getValue());
      if (!isUnique) {
        return Result.fail<void>(`A fruit with the name '${request.name}' already exists`);
      }

      // Use factory to create fruit
      const fruitOrError = FruitFactory.create(request);
      if (fruitOrError.isFailure) {
        return Result.fail<void>(fruitOrError.error as string);
      }

      const fruit = fruitOrError.getValue();

      // Save to repository
      await this.fruitRepo.save(fruit);

      return Result.ok<void>();
    } catch (err) {
      return Result.fail<void>(`Unexpected error: ${err}`);
    }
  }
}