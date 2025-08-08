import { UpdateFruitUseCase } from '../../src/modules/fruits/application/useCases/updateFruit/updateFruit';
import { CreateFruitUseCase } from '../../src/modules/fruits/application/useCases/createFruit/createFruit';
import { MongoFruitRepo } from '../../src/modules/fruits/infrastructure/repos/implementations/mongoFruitRepo';
import { FruitModel } from '../../src/modules/fruits/infrastructure/models/fruitModel';
import mongoose from 'mongoose';

describe('UpdateFruitForFruitStorage', () => {
  let updateFruitUseCase: UpdateFruitUseCase;
  let createFruitUseCase: CreateFruitUseCase;
  let fruitRepo: MongoFruitRepo;

  beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/fruit-storage-test-update');
  });

  beforeEach(async () => {
    // Clean the database
    await FruitModel.deleteMany({});
    
    // Initialize repository and use cases
    fruitRepo = new MongoFruitRepo({ Fruit: FruitModel });
    createFruitUseCase = new CreateFruitUseCase(fruitRepo);
    updateFruitUseCase = new UpdateFruitUseCase(fruitRepo);
    
    // Seed the database with a lemon fruit for all update tests
    const seedResult = await createFruitUseCase.execute({
      name: 'lemon',
      description: 'this is a lemon',
      limitOfFruitToBeStored: 10
    });
    
    // Ensure seeding was successful
    expect(seedResult.isSuccess).toBe(true);
  });

  // Disconnect after all tests
  afterAll(async () => {
    await FruitModel.deleteMany({});
    await mongoose.disconnect();
  });

  describe('Test 1: Update fruit with valid description', () => {
    test('should successfully update lemon description to "updated lemon description"', async () => {
      // Arrange
      const updateData = {
        name: 'lemon',
        description: 'updated lemon description',
        limitOfFruitToBeStored: 10
      };

      // Act
      const result = await updateFruitUseCase.execute(updateData);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.error).toBeUndefined();

      // Verify the fruit was actually updated in the database
      const updatedFruit = await FruitModel.findOne({ name: 'lemon' }).lean();
      expect(updatedFruit).toBeDefined();
      expect(updatedFruit?.description).toBe('updated lemon description');
      expect(updatedFruit?.limitOfFruitToBeStored).toBe(10);
    });

    test('should trigger FruitUpdated domain event', async () => {
      // This test verifies that domain events are properly created
      const updateData = {
        name: 'lemon',
        description: 'updated lemon description',
        limitOfFruitToBeStored: 10
      };

      // You could spy on console.info to verify the domain event is logged
      const consoleSpy = jest.spyOn(console, 'info');
      
      await updateFruitUseCase.execute(updateData);

      // Check if domain event was logged (based on your AggregateRoot implementation)
      const domainEventLogs = consoleSpy.mock.calls.filter(
        call => call[0] === '[Domain Event Created]:'
      );
      
      // Clean up
      consoleSpy.mockRestore();
      
      // Assert that at least one domain event was created
      expect(domainEventLogs.length).toBeGreaterThan(0);
    });
  });

  describe('Test 2: Update fruit with invalid description', () => {
    test('should fail when updating lemon with description longer than 30 characters', async () => {
      // Arrange
      const updateData = {
        name: 'lemon',
        description: 'updated lemon with a long description', // 38 characters - too long!
        limitOfFruitToBeStored: 10
      };

      // Act
      const result = await updateFruitUseCase.execute(updateData);

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('cannot be longer than 30 characters');

      // Verify the fruit was NOT updated in the database
      const unchangedFruit = await FruitModel.findOne({ name: 'lemon' }).lean();
      expect(unchangedFruit).toBeDefined();
      expect(unchangedFruit?.description).toBe('this is a lemon'); // Original description
    });
  });

  describe('Additional Test Cases', () => {
    test('should fail when trying to update non-existent fruit', async () => {
      // Arrange
      const updateData = {
        name: 'orange', // This fruit doesn't exist
        description: 'updated orange',
        limitOfFruitToBeStored: 15
      };

      // Act
      const result = await updateFruitUseCase.execute(updateData);

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('not found');
    });

    test('should successfully update only the limit while keeping description', async () => {
      // Arrange
      const updateData = {
        name: 'lemon',
        description: 'this is a lemon', // Same description
        limitOfFruitToBeStored: 20 // New limit
      };

      // Act
      const result = await updateFruitUseCase.execute(updateData);

      // Assert
      expect(result.isSuccess).toBe(true);

      const updatedFruit = await FruitModel.findOne({ name: 'lemon' }).lean();
      expect(updatedFruit?.description).toBe('this is a lemon');
      expect(updatedFruit?.limitOfFruitToBeStored).toBe(20);
    });

    test('should fail with empty description', async () => {
      // Arrange
      const updateData = {
        name: 'lemon',
        description: '', // Empty description
        limitOfFruitToBeStored: 10
      };

      // Act
      const result = await updateFruitUseCase.execute(updateData);

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.error).toBeDefined();
    });

    test('should fail with negative limit', async () => {
      // Arrange
      const updateData = {
        name: 'lemon',
        description: 'updated lemon',
        limitOfFruitToBeStored: -5 // Negative limit
      };

      // Act
      const result = await updateFruitUseCase.execute(updateData);

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('cannot be negative');
    });
  });
});