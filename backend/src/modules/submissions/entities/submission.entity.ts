import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  OneToMany,
  Column,
} from 'typeorm';
import { Survey } from '../../surveys/entities/survey.entity';
import { User } from '../../users/entities/user.entity';
import { Response } from './response.entity';
import { CustomBaseEntity } from 'src/common/entity/custom-base.entity';

@Entity('tbl_submissions')
export class Submission extends CustomBaseEntity {
  @ManyToOne(() => Survey, (survey) => survey.submissions, {
    onDelete: 'CASCADE',
  })
  survey!: Survey;

  @Column({ type: 'int', nullable: false })
  surveyId!: number;

  @ManyToOne(() => User)
  user!: User;

  @Column({ type: 'int', nullable: false })
  userId!: number;

  @CreateDateColumn()
  submittedAt!: Date;

  @OneToMany(() => Response, (response) => response.submissions, {
    cascade: true,
  })
  responses?: Response[];
}
