
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserTypes } from '../data/user-type.enum';
import { Gender } from '../data/user-gender.enum';
import { AuthProvider } from '../data/auth-provider.enum';


@Entity('tbl_users')
export class User extends CustomBaseEntity {
  @Column({ type: 'varchar', length: 255, nullable: true })
  firstName?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  lastName?: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  phoneNumber!: string;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: false })
  email!: string;

  @Column({ type: 'varchar', length: 512, nullable: true, select: false })
  password?: string;

  @Column({
    type: 'enum',
    enum: Gender,
    nullable: false,
    default: Gender.MALE,
  })
  gender!: string;

  @Column({
    type: 'enum',
    enum: UserTypes,
    nullable: false,
    default: UserTypes.OFFICER,
  })
  userType!: string;

  @Column({
    type: 'enum',
    enum: AuthProvider,
    nullable: false,
    default: AuthProvider.EMAIL,
  })
  authProvider!: string;

  @Column({
    type: 'int',
    nullable: true,
  })
  otp?: number;

  @Column({
    type: 'bigint',
    nullable: true,
    transformer: new NumberTransformer(),
  })
  otpExpiredAt?: number;

  @Column({ type: 'boolean', default: false })
  isSuperAdmin?: boolean;

  @Column({ type: 'boolean', default: false })
  isEmailVerified?: boolean;
}
