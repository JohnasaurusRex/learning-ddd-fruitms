// tests/acceptance/storeFruit.test.ts
import { StoreFruitUseCase } from '../../src/modules/fruits/application/useCases/storeFruit/storeFruit';
import { CreateFruitUseCase } from '../../src/modules/fruits/application/useCases/createFruit/createFruit';
import { MongoFruitRepo } from '../../src/modules/fruits/infrastructure/repos/implementations/mongoFruitRepo';
import { FruitModel } from '../../src/modules/fruits/infrastructure/models/fruitModel';
import mongoose from 'mongoose';

describe('StoreFruitToFruitStorage', () => {
  let storeFruitUseCase: StoreFruitUseCase;
  let createFruitUseCase: CreateFruitUseCase;
  let fruitRepo: MongoFruitRepo;

  beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/fruit-storage-test-store');
  });

  beforeEach(async () => {
    await FruitModel.deleteMany({});
    fruitRepo = new MongoFruitRepo({ Fruit: FruitModel });
    storeFruitUseCase = new StoreFruitUseCase(fruitRepo);
    createFruitUseCase = new CreateFruitUseCase(fruitRepo);

    // Seed with lemon fruit
    await createFruitUseCase.execute({
      name: 'lemon',
      description: 'this is a lemon',
      limitOfFruitToBeStored: 10
    });
  });

  afterAll(async () => {
    await FruitModel.deleteMany({});
    await mongoose.disconnect();
  });

  test('should successfully store 5 lemons when limit is 10', async () => {
    const result = await storeFruitUseCase.execute({
      name: 'lemon',
      amount: 5
    });

    expect(result.isSuccess).toBe(true);
    
    const fruit = await FruitModel.findOne({ name: 'lemon' }).lean();
    expect(fruit?.currentAmount).toBe(5);
  });

  test('should fail to store 11 lemons when limit is 10', async () => {
    const result = await storeFruitUseCase.execute({
      name: 'lemon',
      amount: 11
    });

    expect(result.isFailure).toBe(true);
    expect(result.error).toContain('Cannot store');
  });
});