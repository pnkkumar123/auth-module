import { IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateHeaderDto {
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
