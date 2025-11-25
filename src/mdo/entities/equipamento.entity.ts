import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('equipamentos')
export class Equipamento {
  @PrimaryColumn({ type: 'nvarchar', length: 50 })
  codviat: string; // equipment code

  @Column({ type: 'nvarchar', length: 255 })
  desig: string; // designation/name

  @Column({ type: 'int' })
  inactivo: number; // 0 = active, 1 = inactive (autocomplete only when 0)
}
