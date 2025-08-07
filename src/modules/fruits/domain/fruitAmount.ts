// src/modules/fruits/domain/fruitAmount.ts
import { ValueObject } from '../../../shared/domain/ValueObject';
import { Result } from '../../../shared/domain/Result';
import { FruitLimit } from './fruitLimit';

interface FruitAmountProps {
  value: number;
}

export class FruitAmount extends ValueObject<FruitAmountProps> {
  get value(): number {
    return this.props.value;
  }

  private constructor(props: FruitAmountProps) {
    super(props);
  }

  public static create(amount: number): Result<FruitAmount> {
    if (amount < 0) {
      return Result.fail<FruitAmount>('Amount cannot be negative');
    }

    if (!Number.isInteger(amount)) {
      return Result.fail<FruitAmount>('Amount must be an integer');
    }

    return Result.ok<FruitAmount>(new FruitAmount({ value: amount }));
  }

  public add(amount: FruitAmount): FruitAmount {
    return new FruitAmount({ value: this.value + amount.value });
  }

  public subtract(amount: FruitAmount): Result<FruitAmount> {
    const newValue = this.value - amount.value;
    if (newValue < 0) {
      return Result.fail<FruitAmount>('Cannot subtract more than available amount');
    }
    return Result.ok(new FruitAmount({ value: newValue }));
  }

  public isGreaterThan(amount: FruitAmount): boolean {
    return this.value > amount.value;
  }

  public isLessThanOrEqual(limit: FruitLimit): boolean {
    return this.value <= limit.value;
  }
}