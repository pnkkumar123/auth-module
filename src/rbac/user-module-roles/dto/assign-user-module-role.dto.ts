import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional } from 'class-validator';

export class AssignUserModuleRoleDto {
  @ApiProperty({
    description: 'User ID to assign permissions to',
    example: 2,
    required: true,
    minimum: 1,
  })
  @IsInt()
  userId: number;

  @ApiProperty({
    description: 'Module ID to assign permissions for',
    example: 1,
    required: true,
    minimum: 1,
  })
  @IsInt()
  moduleId: number;

  @ApiProperty({
    description: 'Role ID to assign',
    example: 1,
    required: true,
    minimum: 1,
  })
  @IsInt()
  roleId: number;

  @ApiProperty({
    description: 'Permission to read data in this module',
    example: true,
    required: false,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  canRead?: boolean;

  @ApiProperty({
    description: 'Permission to create data in this module',
    example: false,
    required: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  canCreate?: boolean;

  @ApiProperty({
    description: 'Permission to update data in this module',
    example: false,
    required: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  canUpdate?: boolean;

  @ApiProperty({
    description: 'Permission to delete data in this module',
    example: false,
    required: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  canDelete?: boolean;
}
