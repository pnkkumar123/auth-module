import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateObraDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  obra: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  nome: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  situacao: string;
}