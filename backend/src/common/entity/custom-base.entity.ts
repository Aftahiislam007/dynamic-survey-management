import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Generated,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export class CustomBaseEntity extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  // @Column({ unique: true })
  // @Generated("uuid")
  // uuid: string;

  @Column({ type: 'boolean', nullable: false, default: true })
  isActive!: boolean;

  @Column({ type: 'int', nullable: true })
  createdBy?: number;

  @Column({ type: 'int', nullable: true })
  updatedBy?: number;

  @Column({ type: 'int', nullable: true })
  deletedBy?: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt!: Date;
}
