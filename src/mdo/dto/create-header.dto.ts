import { IsDateString, IsInt, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateHeaderDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  bostamp: string;

  @IsInt()
  @IsNotEmpty()
  userid: number;

  @IsDateString()
  @IsNotEmpty()
  data: Date;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  obra: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  encarregado: string;
}