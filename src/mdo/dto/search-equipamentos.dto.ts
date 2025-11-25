import { IsOptional, IsString, MaxLength } from 'class-validator';

export class SearchEquipamentosDto {
  @IsString()
  @IsOptional()
  @MaxLength(50)
  codviat?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  desig?: string;

  @IsOptional()
  inactivo?: number;
}