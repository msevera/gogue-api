import { Decimal128 } from 'mongodb';

export const BigIntType = {
  type: Decimal128,
  get: (value) => {
    return typeof value !== 'undefined' ? BigInt(value) : undefined;
  },
  set: (value) => {
    return Decimal128.fromString(value.toString());
  },
};
