// src/modules/fruits/interface/graphql/schema.ts
import { makeSchema, objectType, mutationType, queryType, stringArg, intArg, booleanArg, nonNull } from 'nexus';
import * as path from 'path';

const Fruit = objectType({
  name: 'Fruit',
  definition(t) {
    t.nonNull.string('name');
    t.nonNull.string('description');
    t.nonNull.int('limitOfFruitToBeStored');
    t.nonNull.int('currentAmount');
  },
});

const Query = queryType({
  definition(t) {
    t.field('findFruit', {
      type: Fruit,
      args: {
        name: nonNull(stringArg()),
      },
      async resolve(_, args, ctx) {
        const result = await ctx.useCases.findFruit.execute({ name: args.name });
        if (result.isFailure) {
          throw new Error(result.error as string);
        }
        return result.getValue();
      },
    });
  },
});

const Mutation = mutationType({
  definition(t) {
    t.field('createFruitForFruitStorage', {
      type: 'Boolean',
      args: {
        name: nonNull(stringArg()),
        description: nonNull(stringArg()),
        limitOfFruitToBeStored: nonNull(intArg()),
      },
      async resolve(_, args, ctx) {
        const result = await ctx.useCases.createFruit.execute(args);
        if (result.isFailure) {
          throw new Error(result.error as string);
        }
        return true;
      },
    });

    t.field('updateFruitForFruitStorage', {
      type: 'Boolean',
      args: {
        name: nonNull(stringArg()),
        description: nonNull(stringArg()),
        limitOfFruitToBeStored: nonNull(intArg()),
      },
      async resolve(_, args, ctx) {
        const result = await ctx.useCases.updateFruit.execute(args);
        if (result.isFailure) {
          throw new Error(result.error as string);
        }
        return true;
      },
    });

    t.field('deleteFruitFromFruitStorage', {
      type: 'Boolean',
      args: {
        name: nonNull(stringArg()),
        forceDelete: nonNull(booleanArg()),
      },
      async resolve(_, args, ctx) {
        const result = await ctx.useCases.deleteFruit.execute(args);
        if (result.isFailure) {
          throw new Error(result.error as string);
        }
        return true;
      },
    });

    t.field('storeFruitToFruitStorage', {
      type: 'Boolean',
      args: {
        name: nonNull(stringArg()),
        amount: nonNull(intArg()),
      },
      async resolve(_, args, ctx) {
        const result = await ctx.useCases.storeFruit.execute(args);
        if (result.isFailure) {
          throw new Error(result.error as string);
        }
        return true;
      },
    });

    t.field('removeFruitFromFruitStorage', {
      type: 'Boolean',
      args: {
        name: nonNull(stringArg()),
        amount: nonNull(intArg()),
      },
      async resolve(_, args, ctx) {
        const result = await ctx.useCases.removeFruit.execute(args);
        if (result.isFailure) {
          throw new Error(result.error as string);
        }
        return true;
      },
    });
  },
});

export const schema = makeSchema({
  types: [Fruit, Query, Mutation],
  outputs: {
    schema: path.join(__dirname, '../../../../../generated/schema.graphql'),
    typegen: path.join(__dirname, '../../../../../generated/nexus.ts'),
  },
});