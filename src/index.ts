// src/index.ts
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import mongoose from 'mongoose';
import { schema } from './modules/fruits/interface/graphql/schema';
import { MongoFruitRepo } from './modules/fruits/infrastructure/repos/implementations/mongoFruitRepo';
import { FruitModel } from './modules/fruits/infrastructure/models/fruitModel';
import { CreateFruitUseCase } from './modules/fruits/application/useCases/createFruit/createFruit';
import { UpdateFruitUseCase } from './modules/fruits/application/useCases/updateFruit/updateFruit';
import { DeleteFruitUseCase } from './modules/fruits/application/useCases/deleteFruit/deleteFruit';
import { StoreFruitUseCase } from './modules/fruits/application/useCases/storeFruit/storeFruit';
import { RemoveFruitUseCase } from './modules/fruits/application/useCases/removeFruit/removeFruit';
import { FindFruitUseCase } from './modules/fruits/application/useCases/findFruit/findFruit';
import { EventStore } from './shared/infrastructure/events/EventStore';
import { DomainEvents } from './shared/domain/DomainEvents';

async function startServer() {
  // Connect to MongoDB
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fruit-storage');

  // Initialize repositories
  const models = { Fruit: FruitModel };
  const fruitRepo = new MongoFruitRepo(models);

  // Initialize use cases
  const useCases = {
    createFruit: new CreateFruitUseCase(fruitRepo),
    updateFruit: new UpdateFruitUseCase(fruitRepo),
    deleteFruit: new DeleteFruitUseCase(fruitRepo),
    storeFruit: new StoreFruitUseCase(fruitRepo),
    removeFruit: new RemoveFruitUseCase(fruitRepo),
    findFruit: new FindFruitUseCase(fruitRepo)
  };

  // Initialize event store for transactional outbox
  const eventStore = new EventStore();

  // Register domain event handlers
  DomainEvents.register((event) => {
    eventStore.saveEvent(event);
  }, 'FruitCreated');

  DomainEvents.register((event) => {
    eventStore.saveEvent(event);
  }, 'FruitUpdated');

  DomainEvents.register((event) => {
    eventStore.saveEvent(event);
  }, 'FruitDeleted');

  // Create Express app
  const app = express();

  // Create Apollo Server
  const server = new ApolloServer({
    schema,
    context: () => ({ useCases })
  });

  await server.start();
  server.applyMiddleware({ app: app as any });

  const PORT = process.env.PORT || 4000;
  
  app.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});