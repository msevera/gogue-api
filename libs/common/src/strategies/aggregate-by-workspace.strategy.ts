import {
  ContextId,
  ContextIdFactory,
  ContextIdResolver,
  ContextIdResolverFn,
  ContextIdStrategy,
  HostComponentInfo,
} from '@nestjs/core';
import { Request } from 'express';

export class AggregateByWorkspaceContextIdStrategy implements ContextIdStrategy {
  // A collection of context identifiers representing separate DI sub-trees per workspace
  private readonly workspaces = new Map<string, ContextId>();

  attach(
    contextId: ContextId,
    request: Request,
  ): ContextIdResolverFn | ContextIdResolver {
    const tenantId = request.headers['x-tenant-id'] as string;
    if (!tenantId) {
      // OR log error depending on what we want to accomplish
      return () => contextId;
    }

    let workspaceSubTreeId: ContextId;
    if (this.workspaces.has(tenantId)) {
      workspaceSubTreeId = this.workspaces.get(tenantId);
    } else {
      // Construct a new context id
      workspaceSubTreeId = ContextIdFactory.create();
      this.workspaces.set(tenantId, workspaceSubTreeId);
      setTimeout(() => this.workspaces.delete(tenantId), 3000);
    }

    return {
      payload: { tenantId },
      resolve: (info: HostComponentInfo) =>
        info.isTreeDurable ? workspaceSubTreeId : contextId,
    };
  }
}