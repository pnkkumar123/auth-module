import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('obras')
export class Obra {
  @PrimaryColumn({ type: 'nvarchar', length: 50 })
  obra: string; // project code

  @Column({ type: 'nvarchar', length: 255 })
  nome: string;

  @Column({ type: 'nvarchar', length: 10 })
  situacao: string; // must start with 3,4,5,7 for autocomplete
}
