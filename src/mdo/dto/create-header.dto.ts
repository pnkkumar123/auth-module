import { IsDateString, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateHeaderDto {
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
