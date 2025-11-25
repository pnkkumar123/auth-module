import { IsDateString, IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateHeaderDto {
  @IsString()
  @IsOptional()
  @MaxLength(30)
  bostamp?: string;

  @IsInt()
  @IsOptional()
  userid?: number;

  @IsDateString()
  @IsOptional()
  data?: Date;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  obra?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  encarregado?: string;
}