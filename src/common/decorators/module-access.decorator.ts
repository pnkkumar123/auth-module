import { SetMetadata } from '@nestjs/common';

export const MODULE_ACCESS_KEY = 'module_access';

export type ModuleAction = 'read' | 'create' | 'update' | 'delete';

export interface ModuleAccessMeta {
  moduleCode: string;
  action: ModuleAction;
}

export const ModuleAccess = (
  moduleCode: string,
  action: ModuleAction,
) => SetMetadata(MODULE_ACCESS_KEY, { moduleCode, action } as ModuleAccessMeta);
