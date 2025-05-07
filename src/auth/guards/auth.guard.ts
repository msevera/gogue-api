import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { UsersService } from '../../users/users.service';
import { User } from '../../users/entities/user.entity';
import { FirebaseService } from '../../firebase/firebase.service';
import { REQUEST_USER_KEY, REQUEST_WORKSPACE_ID_KEY } from '@app/common/constants/auth.constant';
import { AUTH_KEY } from '@app/common/decorators/auth.decorator';
import { Role } from '@app/common/dtos/role.enum.dto';

@Injectable()
export class AuthGuard implements CanActivate {
  private rolesOrder: Role[] = [Role.CONSUMER, Role.ADMIN];

  constructor(
    private readonly reflector: Reflector,
    private readonly usersService: UsersService,
    private readonly firebaseService: FirebaseService,
  ) { }

  async canActivate(context: ExecutionContext) {
    const request = GqlExecutionContext.create(context).getContext().req;
    if (request?.extra?.authContext) {
      request[REQUEST_USER_KEY] = request.extra.authContext.user;
      request[REQUEST_WORKSPACE_ID_KEY] = request.extra.authContext.workspaceId;
      return true;
    }

    const token = this.extractTokenFromHeader(request);
    let user: User;
    let tenantId: string;
    // Verify Firebase token and get user
    try {
      if (token) {
        const firebaseUser = await this.firebaseService.getUser(token);
        user = await this.usersService.findOneByUID(firebaseUser.uid, { throwErrorIfNotFound: false });
        request[REQUEST_USER_KEY] = user;
        tenantId = request.headers['x-tenant-id'] as string;
        if (tenantId) {
          if (user.workspaces.find((w) => w.workspaceId === tenantId)) {
            request[REQUEST_WORKSPACE_ID_KEY] = tenantId;
          } else {
            throw new UnauthorizedException('Workspace not found');
          }
        }
      }
    } catch (error) {
      console.log('AuthGuard error', error);
      throw error;
    }

    // Check role requirements
    const requiredRole = this.reflector.getAllAndOverride<Role>(AUTH_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (requiredRole === undefined) {
      return true;
    }

    if (!token || (token && !tenantId)) {
      throw new UnauthorizedException();
    }

    // Role-based authorization
    const userRoleIndex = this.rolesOrder.findIndex((r) => r === user?.role);
    const requiredRoleIndex = this.rolesOrder.findIndex((r) => r === requiredRole);
    return userRoleIndex >= requiredRoleIndex;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    // eslint-disable-next-line
    const [_, token] = request.headers['authorization']?.split(' ') ?? [];
    return token;
  }
}
