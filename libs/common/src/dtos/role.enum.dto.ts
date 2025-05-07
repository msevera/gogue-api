import { registerEnumType } from '@nestjs/graphql';

export enum Role {
  CONSUMER = 'CONSUMER',
  ADMIN = 'ADMIN',
}

registerEnumType(Role, {
  name: 'Role',
});
