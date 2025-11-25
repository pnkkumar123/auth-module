import { IsInt, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateEquipamentoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  codviat: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  desig: string;

  @IsInt()
  inactivo: number;
}