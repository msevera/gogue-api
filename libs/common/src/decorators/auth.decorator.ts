import { SetMetadata } from '@nestjs/common';
import { Role } from '../dtos/role.enum.dto';

export const AUTH_KEY = 'auth';
export const Auth = (role: Role) => SetMetadata(AUTH_KEY, role);
