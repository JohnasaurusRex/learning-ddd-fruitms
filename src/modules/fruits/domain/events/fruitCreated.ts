// src/modules/fruits/domain/events/fruitCreated.ts
import { DomainEvent } from '../../../../shared/domain/DomainEvent';
import { UniqueEntityID } from '../../../../shared/domain/UniqueEntityID';
import { Fruit } from '../fruit';

export class FruitCreated implements DomainEvent {
  public dateTimeOccurred: Date;
  public fruit: Fruit;

  constructor(fruit: Fruit) {
    this.dateTimeOccurred = new Date();
    this.fruit = fruit;
  }

  getAggregateId(): UniqueEntityID {
    return this.fruit.id;
  }
}