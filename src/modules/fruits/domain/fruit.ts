// src/modules/fruits/domain/fruit.ts
import { AggregateRoot } from '../../../shared/domain/AggregateRoot';
import { UniqueEntityID } from '../../../shared/domain/UniqueEntityID';
import { Result } from '../../../shared/domain/Result';
import { FruitName } from './fruitName';
import { FruitDescription } from './fruitDescription';
import { FruitLimit } from './fruitLimit';
import { FruitAmount } from './fruitAmount';
import { FruitCreated } from './events/fruitCreated';
import { FruitUpdated } from './events/fruitUpdated';
import { FruitDeleted } from './events/fruitDeleted';

interface FruitProps {
  name: FruitName;
  description: FruitDescription;
  limitOfFruitToBeStored: FruitLimit;
  currentAmount: FruitAmount;
}

export class Fruit extends AggregateRoot<FruitProps> {
  get fruitId(): UniqueEntityID {
    return this._id;
  }

  get name(): FruitName {
    return this.props.name;
  }

  get description(): FruitDescription {
    return this.props.description;
  }

  get limitOfFruitToBeStored(): FruitLimit {
    return this.props.limitOfFruitToBeStored;
  }

  get currentAmount(): FruitAmount {
    return this.props.currentAmount;
  }

  private constructor(props: FruitProps, id?: UniqueEntityID) {
    super(props, id);
  }

  public static create(
    props: FruitProps,
    id?: UniqueEntityID
  ): Result<Fruit> {
    const fruit = new Fruit(props, id);

    const isNewFruit = !!id === false;
    if (isNewFruit) {
      fruit.addDomainEvent(new FruitCreated(fruit));
    }

    return Result.ok<Fruit>(fruit);
  }

  public updateDetails(
    description: FruitDescription,
    limit: FruitLimit
  ): Result<void> {
    this.props.description = description;
    this.props.limitOfFruitToBeStored = limit;
    
    this.addDomainEvent(new FruitUpdated(this));
    
    return Result.ok<void>();
  }

  public storeFruit(amount: FruitAmount): Result<void> {
    const newAmount = this.props.currentAmount.add(amount);
    
    if (!newAmount.isLessThanOrEqual(this.props.limitOfFruitToBeStored)) {
      return Result.fail<void>(
        `Cannot store ${amount.value} fruits. Current: ${this.props.currentAmount.value}, ` +
        `Limit: ${this.props.limitOfFruitToBeStored.value}`
      );
    }
    
    this.props.currentAmount = newAmount;
    return Result.ok<void>();
  }

  public removeFruit(amount: FruitAmount): Result<void> {
    const subtractResult = this.props.currentAmount.subtract(amount);
    
    if (subtractResult.isFailure) {
      return Result.fail<void>(
        `Cannot remove ${amount.value} fruits. Only ${this.props.currentAmount.value} available`
      );
    }
    
    this.props.currentAmount = subtractResult.getValue();
    return Result.ok<void>();
  }

  public canBeDeleted(): boolean {
    return this.props.currentAmount.value === 0;
  }

  public markAsDeleted(): void {
    this.addDomainEvent(new FruitDeleted(this));
  }
}