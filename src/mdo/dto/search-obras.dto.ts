import { IsOptional, IsString, MaxLength } from 'class-validator';

export class SearchObrasDto {
  @IsString()
  @IsOptional()
  @MaxLength(50)
  obra?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  nome?: string;

  @IsString()
  @IsOptional()
  @MaxLength(10)
  situacao?: string;

  @IsString()
  @IsOptional()
  @MaxLength(3000)
  query?: string;
}