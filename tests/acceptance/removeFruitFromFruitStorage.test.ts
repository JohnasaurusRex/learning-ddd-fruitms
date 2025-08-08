// tests/acceptance/removeFruitFromFruitStorage.test.ts
import { RemoveFruitUseCase } from '../../src/modules/fruits/application/useCases/removeFruit/removeFruit';
import { CreateFruitUseCase } from '../../src/modules/fruits/application/useCases/createFruit/createFruit';
import { StoreFruitUseCase } from '../../src/modules/fruits/application/useCases/storeFruit/storeFruit';
import { MongoFruitRepo } from '../../src/modules/fruits/infrastructure/repos/implementations/mongoFruitRepo';
import { FruitModel } from '../../src/modules/fruits/infrastructure/models/fruitModel';
import mongoose from 'mongoose';

describe('RemoveFruitFromFruitStorage', () => {
  let removeFruitUseCase: RemoveFruitUseCase;
  let createFruitUseCase: CreateFruitUseCase;
  let storeFruitUseCase: StoreFruitUseCase;
  let fruitRepo: MongoFruitRepo;

  beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/fruit-storage-test-remove');
  });

  beforeEach(async () => {
    await FruitModel.deleteMany({});
    fruitRepo = new MongoFruitRepo({ Fruit: FruitModel });
    removeFruitUseCase = new RemoveFruitUseCase(fruitRepo);
    createFruitUseCase = new CreateFruitUseCase(fruitRepo);
    storeFruitUseCase = new StoreFruitUseCase(fruitRepo);
  });

  afterAll(async () => {
    await FruitModel.deleteMany({});
    await mongoose.disconnect();
  });

  test('should successfully remove 5 lemons when there are exactly 5 lemons in storage', async () => {
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

    // Remove exactly 5 lemons (should pass)
    const result = await removeFruitUseCase.execute({
      name: 'lemon',
      amount: 5
    });

    expect(result.isSuccess).toBe(true);

    // Verify the fruit now has 0 items in storage
    const fruit = await FruitModel.findOne({ name: 'lemon' }).lean();
    expect(fruit).toBeDefined();
    expect(fruit?.currentAmount).toBe(0);
  });

  test('should fail to remove 6 lemons when there are only 5 lemons in storage', async () => {
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

    // Try to remove 6 lemons (should fail)
    const result = await removeFruitUseCase.execute({
      name: 'lemon',
      amount: 6
    });

    expect(result.isFailure).toBe(true);
    expect(result.error).toContain('Cannot remove');
    expect(result.error).toContain('Only 5 available');

    // Verify the fruit still has 5 items in storage (unchanged)
    const fruit = await FruitModel.findOne({ name: 'lemon' }).lean();
    expect(fruit).toBeDefined();
    expect(fruit?.currentAmount).toBe(5);
  });

  test('should fail to remove fruit that does not exist', async () => {
    const result = await removeFruitUseCase.execute({
      name: 'non-existent-fruit',
      amount: 1
    });

    expect(result.isFailure).toBe(true);
    expect(result.error).toContain('not found');
  });

  test('should successfully remove partial amount from storage', async () => {
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

    // Remove 3 lemons (should pass)
    const result = await removeFruitUseCase.execute({
      name: 'lemon',
      amount: 3
    });

    expect(result.isSuccess).toBe(true);

    // Verify the fruit now has 2 items in storage
    const fruit = await FruitModel.findOne({ name: 'lemon' }).lean();
    expect(fruit).toBeDefined();
    expect(fruit?.currentAmount).toBe(2);
  });

  test('should fail to remove from fruit with 0 items in storage', async () => {
    // Seed with lemon fruit (but don't store any)
    await createFruitUseCase.execute({
      name: 'lemon',
      description: 'this is a lemon',
      limitOfFruitToBeStored: 10
    });

    // Try to remove 1 lemon from empty storage (should fail)
    const result = await removeFruitUseCase.execute({
      name: 'lemon',
      amount: 1
    });

    expect(result.isFailure).toBe(true);
    expect(result.error).toContain('Cannot remove');
    expect(result.error).toContain('Only 0 available');

    // Verify the fruit still has 0 items in storage
    const fruit = await FruitModel.findOne({ name: 'lemon' }).lean();
    expect(fruit).toBeDefined();
    expect(fruit?.currentAmount).toBe(0);
  });
});
