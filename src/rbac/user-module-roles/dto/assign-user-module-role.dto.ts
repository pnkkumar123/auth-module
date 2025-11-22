import { IsBoolean, IsInt, IsOptional } from 'class-validator';

export class AssignUserModuleRoleDto {
  @IsInt()
  userId: number;

  @IsInt()
  moduleId: number;

  @IsInt()
  roleId: number;

  @IsOptional()
  @IsBoolean()
  canRead?: boolean;

  @IsOptional()
  @IsBoolean()
  canCreate?: boolean;

  @IsOptional()
  @IsBoolean()
  canUpdate?: boolean;

  @IsOptional()
  @IsBoolean()
  canDelete?: boolean;
}
