import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
} from 'typeorm';
import { Submission } from './submission.entity';
import { Field } from '../../fields/entities/field.entity';
import { CustomBaseEntity } from 'src/common/entity/custom-base.entity';

@Entity('tbl_responses')
export class Response extends CustomBaseEntity {
  @ManyToOne(() => Submission, (submission) => submission.responses, {
    onDelete: 'CASCADE',
  })
  submissions!: Submission;

  @Column({ type: 'int', nullable: false })
  submissionId!: number;

  @ManyToOne(() => Field)
  field!: Field;

  @Column({ type: 'int', nullable: false })
  fieldId!: number;

  @Column({ type: 'jsonb', nullable: false })
  value!: any;
}