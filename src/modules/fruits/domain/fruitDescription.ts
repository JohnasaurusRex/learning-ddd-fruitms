// src/modules/fruits/domain/fruitDescription.ts
import { ValueObject } from '../../../shared/domain/ValueObject';
import { Result } from '../../../shared/domain/Result';

interface FruitDescriptionProps {
  value: string;
}

export class FruitDescription extends ValueObject<FruitDescriptionProps> {
  public static maxLength: number = 30;

  get value(): string {
    return this.props.value;
  }

  private constructor(props: FruitDescriptionProps) {
    super(props);
  }

  public static create(description: string): Result<FruitDescription> {
    if (!description) {
      return Result.fail<FruitDescription>('Description cannot be null or undefined');
    }

    if (description.length > this.maxLength) {
      return Result.fail<FruitDescription>(`Description cannot be longer than ${this.maxLength} characters`);
    }

    return Result.ok<FruitDescription>(new FruitDescription({ value: description }));
  }
}