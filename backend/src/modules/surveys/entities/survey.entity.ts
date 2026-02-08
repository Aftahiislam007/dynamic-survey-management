import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { CustomBaseEntity } from 'src/common/entity/custom-base.entity';
import { SurveyStatus } from '../data/survey-status.enum';
import { User } from 'src/modules/users/entities/user.entity';

@Entity('tbl_surveys')
export class Survey extends CustomBaseEntity {
  @Column({ type: 'varchar', length: 500, nullable: false })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: SurveyStatus,
    nullable: false,
    default: SurveyStatus.DRAFT,
  })
  status!: string;

  @Column({ type: 'date', nullable: true })
  startDate?: Date;

  @Column({ type: 'date', nullable: true })
  endDate?: Date;

  @Column({ type: 'boolean', default: true })
  isPublic?: boolean;

  @Column({ type: 'int', nullable: true })
  targetResponses?: number;

  @Column({ type: 'int', default: 0 })
  totalResponses?: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assignedOfficerId' })
  assignedOfficer?: User;

  @Column({ type: 'int', nullable: true })
  assignedOfficerId?: number;
}
