// src/modules/fruits/domain/fruitName.ts
import { ValueObject } from '../../../shared/domain/ValueObject';
import { Result } from '../../../shared/domain/Result';

interface FruitNameProps {
  value: string;
}

export class FruitName extends ValueObject<FruitNameProps> {
  public static maxLength: number = 50;
  public static minLength: number = 1;

  get value(): string {
    return this.props.value;
  }

  private constructor(props: FruitNameProps) {
    super(props);
  }

  public static create(name: string): Result<FruitName> {
    if (!name || name.trim().length === 0) {
      return Result.fail<FruitName>('Fruit name cannot be empty');
    }

    if (name.length < this.minLength || name.length > this.maxLength) {
      return Result.fail<FruitName>(`Fruit name must be between ${this.minLength} and ${this.maxLength} characters`);
    }

    return Result.ok<FruitName>(new FruitName({ value: name.trim() }));
  }
}