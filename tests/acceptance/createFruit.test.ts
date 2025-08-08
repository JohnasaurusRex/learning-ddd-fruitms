// tests/acceptance/createFruit.test.ts
import { CreateFruitUseCase } from '../../src/modules/fruits/application/useCases/createFruit/createFruit';
import { MongoFruitRepo } from '../../src/modules/fruits/infrastructure/repos/implementations/mongoFruitRepo';
import { FruitModel } from '../../src/modules/fruits/infrastructure/models/fruitModel';
import mongoose from 'mongoose';

describe('CreateFruitForFruitStorage', () => {
  let createFruitUseCase: CreateFruitUseCase;
  let fruitRepo: MongoFruitRepo;

  beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/fruit-storage-test-create');
  });

  beforeEach(async () => {
    await FruitModel.deleteMany({});
    fruitRepo = new MongoFruitRepo({ Fruit: FruitModel });
    createFruitUseCase = new CreateFruitUseCase(fruitRepo);
  });

  afterAll(async () => {
    await FruitModel.deleteMany({});
    await mongoose.disconnect();
  });

  test('should create a fruit called lemon with valid description', async () => {
    const result = await createFruitUseCase.execute({
      name: 'lemon',
      description: 'this is a lemon',
      limitOfFruitToBeStored: 10
    });

    expect(result.isSuccess).toBe(true);
    
    const savedFruit = await FruitModel.findOne({ name: 'lemon' }).lean();
    expect(savedFruit).toBeDefined();
    expect(savedFruit?.description).toBe('this is a lemon');
  });

  test('should fail when creating fruit with description longer than 30 characters', async () => {
    const result = await createFruitUseCase.execute({
      name: 'lemon',
      description: 'this is a fruit with a very long description',
      limitOfFruitToBeStored: 10
    });

    expect(result.isFailure).toBe(true);
    expect(result.error).toContain('cannot be longer than 30 characters');
  });

  test('should fail when creating duplicate fruit', async () => {
    // First creation
    await createFruitUseCase.execute({
      name: 'lemon',
      description: 'this is a lemon',
      limitOfFruitToBeStored: 10
    });

    // Duplicate creation
    const result = await createFruitUseCase.execute({
      name: 'lemon',
      description: 'this is a lemon',
      limitOfFruitToBeStored: 10
    });

    expect(result.isFailure).toBe(true);
    expect(result.error).toContain('already exists');
  });
});