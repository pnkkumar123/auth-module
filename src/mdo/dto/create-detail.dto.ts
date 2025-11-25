import { IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateDetailDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  bostamp: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  empresa?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  nfunc?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  codviat?: string;

  @IsNumber()
  @IsOptional()
  qtt?: number;
}
