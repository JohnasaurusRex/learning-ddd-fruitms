// tests/acceptance/findFruit.test.ts
import { FindFruitUseCase } from '../../src/modules/fruits/application/useCases/findFruit/findFruit';
import { CreateFruitUseCase } from '../../src/modules/fruits/application/useCases/createFruit/createFruit';
import { StoreFruitUseCase } from '../../src/modules/fruits/application/useCases/storeFruit/storeFruit';
import { MongoFruitRepo } from '../../src/modules/fruits/infrastructure/repos/implementations/mongoFruitRepo';
import { FruitModel } from '../../src/modules/fruits/infrastructure/models/fruitModel';
import mongoose from 'mongoose';

describe('FindFruit', () => {
  let findFruitUseCase: FindFruitUseCase;
  let createFruitUseCase: CreateFruitUseCase;
  let storeFruitUseCase: StoreFruitUseCase;
  let fruitRepo: MongoFruitRepo;

  beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/fruit-storage-test-find');
  });

  beforeEach(async () => {
    await FruitModel.deleteMany({});
    fruitRepo = new MongoFruitRepo({ Fruit: FruitModel });
    findFruitUseCase = new FindFruitUseCase(fruitRepo);
    createFruitUseCase = new CreateFruitUseCase(fruitRepo);
    storeFruitUseCase = new StoreFruitUseCase(fruitRepo);
  });

  afterAll(async () => {
    await FruitModel.deleteMany({});
    await mongoose.disconnect();
  });

  test('should successfully find lemon fruit when it exists in storage', async () => {
    // Seed with lemon fruit
    await createFruitUseCase.execute({
      name: 'lemon',
      description: 'this is a lemon',
      limitOfFruitToBeStored: 10
    });

    // Store some lemons to have currentAmount > 0
    await storeFruitUseCase.execute({
      name: 'lemon',
      amount: 5
    });

    // Find the lemon fruit (should pass)
    const result = await findFruitUseCase.execute({
      name: 'lemon'
    });

    expect(result.isSuccess).toBe(true);
    
    const fruitData = result.getValue();
    expect(fruitData).toBeDefined();
    expect(fruitData.name).toBe('lemon');
    expect(fruitData.description).toBe('this is a lemon');
    expect(fruitData.limitOfFruitToBeStored).toBe(10);
    expect(fruitData.currentAmount).toBe(5);
  });

  test('should fail to find fruit that does not exist and throw an error', async () => {
    // Try to find a fruit that doesn't exist (should fail)
    const result = await findFruitUseCase.execute({
      name: 'not a lemon'
    });

    expect(result.isFailure).toBe(true);
    expect(result.error).toContain('not found');
    expect(result.error).toContain('not a lemon');
  });

  test('should successfully find fruit with 0 currentAmount', async () => {
    // Seed with lemon fruit (but don't store any)
    await createFruitUseCase.execute({
      name: 'lemon',
      description: 'this is a lemon',
      limitOfFruitToBeStored: 10
    });

    // Find the lemon fruit (should pass even with 0 currentAmount)
    const result = await findFruitUseCase.execute({
      name: 'lemon'
    });

    expect(result.isSuccess).toBe(true);
    
    const fruitData = result.getValue();
    expect(fruitData).toBeDefined();
    expect(fruitData.name).toBe('lemon');
    expect(fruitData.description).toBe('this is a lemon');
    expect(fruitData.limitOfFruitToBeStored).toBe(10);
    expect(fruitData.currentAmount).toBe(0);
  });

  test('should find fruit with different name case sensitivity', async () => {
    // Seed with lemon fruit
    await createFruitUseCase.execute({
      name: 'lemon',
      description: 'this is a lemon',
      limitOfFruitToBeStored: 10
    });

    // Try to find with different case (should depend on FruitName validation)
    const result = await findFruitUseCase.execute({
      name: 'LEMON'
    });

    // This will fail because fruit names are case-sensitive in this domain
    expect(result.isFailure).toBe(true);
    expect(result.error).toContain('not found');
  });

  test('should find multiple different fruits correctly', async () => {
    // Seed with multiple fruits
    await createFruitUseCase.execute({
      name: 'lemon',
      description: 'this is a lemon',
      limitOfFruitToBeStored: 10
    });

    await createFruitUseCase.execute({
      name: 'apple',
      description: 'this is an apple',
      limitOfFruitToBeStored: 15
    });

    // Store different amounts
    await storeFruitUseCase.execute({
      name: 'lemon',
      amount: 3
    });

    await storeFruitUseCase.execute({
      name: 'apple',
      amount: 7
    });

    // Find lemon
    const lemonResult = await findFruitUseCase.execute({
      name: 'lemon'
    });

    expect(lemonResult.isSuccess).toBe(true);
    const lemonData = lemonResult.getValue();
    expect(lemonData.name).toBe('lemon');
    expect(lemonData.currentAmount).toBe(3);
    expect(lemonData.limitOfFruitToBeStored).toBe(10);

    // Find apple
    const appleResult = await findFruitUseCase.execute({
      name: 'apple'
    });

    expect(appleResult.isSuccess).toBe(true);
    const appleData = appleResult.getValue();
    expect(appleData.name).toBe('apple');
    expect(appleData.currentAmount).toBe(7);
    expect(appleData.limitOfFruitToBeStored).toBe(15);
  });
});
