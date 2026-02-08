import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Survey } from '../../surveys/entities/survey.entity';
import { CustomBaseEntity } from 'src/common/entity/custom-base.entity';

@Entity('tbl_fields')
export class Field extends CustomBaseEntity {
  @Column({ type: 'varchar', length: 255, nullable: false })
  label!: string;

  @Column({
    type: 'enum',
    enum: ['text', 'checkbox', 'radio', 'select'],
    nullable: false,
  })
  type!: 'text' | 'checkbox' | 'radio' | 'select';

  @Column({ type: 'boolean', default: false })
  required!: boolean;

  @Column('jsonb', { nullable: true })
  options?: string[];

  @Column('jsonb', { nullable: true })
  validationRules?: Record<string, any>;

  @ManyToOne(() => Survey, (survey) => survey.fields, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'surveyId' })
  survey!: Survey;

  @Column({ type: 'uuid', nullable: false })
  surveyId!: string;
}
