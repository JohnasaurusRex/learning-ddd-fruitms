// src/modules/fruits/domain/fruitLimit.ts
import { ValueObject } from '../../../shared/domain/ValueObject';
import { Result } from '../../../shared/domain/Result';

interface FruitLimitProps {
  value: number;
}

export class FruitLimit extends ValueObject<FruitLimitProps> {
  get value(): number {
    return this.props.value;
  }

  private constructor(props: FruitLimitProps) {
    super(props);
  }

  public static create(limit: number): Result<FruitLimit> {
    if (limit < 0) {
      return Result.fail<FruitLimit>('Limit cannot be negative');
    }

    if (!Number.isInteger(limit)) {
      return Result.fail<FruitLimit>('Limit must be an integer');
    }

    return Result.ok<FruitLimit>(new FruitLimit({ value: limit }));
  }
}