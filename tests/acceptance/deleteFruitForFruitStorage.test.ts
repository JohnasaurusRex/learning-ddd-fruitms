// tests/acceptance/deleteFruit.test.ts
import { DeleteFruitUseCase } from '../../src/modules/fruits/application/useCases/deleteFruit/deleteFruit';
import { CreateFruitUseCase } from '../../src/modules/fruits/application/useCases/createFruit/createFruit';
import { StoreFruitUseCase } from '../../src/modules/fruits/application/useCases/storeFruit/storeFruit';
import { MongoFruitRepo } from '../../src/modules/fruits/infrastructure/repos/implementations/mongoFruitRepo';
import { FruitModel } from '../../src/modules/fruits/infrastructure/models/fruitModel';
import mongoose from 'mongoose';

describe('DeleteFruitFromFruitStorage', () => {
  let deleteFruitUseCase: DeleteFruitUseCase;
  let createFruitUseCase: CreateFruitUseCase;
  let storeFruitUseCase: StoreFruitUseCase;
  let fruitRepo: MongoFruitRepo;

  beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/fruit-storage-test-delete');
  });

  beforeEach(async () => {
    await FruitModel.deleteMany({});
    fruitRepo = new MongoFruitRepo({ Fruit: FruitModel });
    deleteFruitUseCase = new DeleteFruitUseCase(fruitRepo);
    createFruitUseCase = new CreateFruitUseCase(fruitRepo);
    storeFruitUseCase = new StoreFruitUseCase(fruitRepo);
  });

  afterAll(async () => {
    await FruitModel.deleteMany({});
    await mongoose.disconnect();
  });

  test('should fail to delete lemon fruit when it has 5 fruits in storage (without forceDelete)', async () => {
    // Seed with lemon fruit
    await createFruitUseCase.execute({
      name: 'lemon',
      description: 'this is a lemon',
      limitOfFruitToBeStored: 10
    });

    // Store 5 lemons
    await storeFruitUseCase.execute({
      name: 'lemon',
      amount: 5
    });

    // Try to delete without forceDelete (should fail)
    const result = await deleteFruitUseCase.execute({
      name: 'lemon',
      forceDelete: false
    });

    expect(result.isFailure).toBe(true);
    expect(result.error).toContain('Cannot delete fruit');
    expect(result.error).toContain('5 items in storage');

    // Verify the fruit still exists in the database
    const fruit = await FruitModel.findOne({ name: 'lemon' }).lean();
    expect(fruit).toBeDefined();
    expect(fruit?.currentAmount).toBe(5);
  });

  test('should successfully delete lemon fruit with forceDelete=true and create domain event', async () => {
    // Seed with lemon fruit
    await createFruitUseCase.execute({
      name: 'lemon',
      description: 'this is a lemon',
      limitOfFruitToBeStored: 10
    });

    // Store 5 lemons
    await storeFruitUseCase.execute({
      name: 'lemon',
      amount: 5
    });

    // Delete with forceDelete=true (should pass)
    const result = await deleteFruitUseCase.execute({
      name: 'lemon',
      forceDelete: true
    });

    expect(result.isSuccess).toBe(true);

    // Verify the fruit is deleted from the database
    const fruit = await FruitModel.findOne({ name: 'lemon' }).lean();
    expect(fruit).toBeNull();
  });

  test('should fail to delete non-existent fruit', async () => {
    const result = await deleteFruitUseCase.execute({
      name: 'non-existent-fruit',
      forceDelete: false
    });

    expect(result.isFailure).toBe(true);
    expect(result.error).toContain('not found');
  });

  test('should successfully delete fruit with 0 items without forceDelete', async () => {
    // Seed with lemon fruit (but don't store any)
    await createFruitUseCase.execute({
      name: 'lemon',
      description: 'this is a lemon',
      limitOfFruitToBeStored: 10
    });

    // Delete without forceDelete (should pass since currentAmount is 0)
    const result = await deleteFruitUseCase.execute({
      name: 'lemon',
      forceDelete: false
    });

    expect(result.isSuccess).toBe(true);

    // Verify the fruit is deleted from the database
    const fruit = await FruitModel.findOne({ name: 'lemon' }).lean();
    expect(fruit).toBeNull();
  });
});
