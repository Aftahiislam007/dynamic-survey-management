import { IsEmail, IsNotEmpty } from 'class-validator';
import { CustomBaseEntity } from 'src/common/entity/custom-base.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';

@Entity('tbl_login_info')
export class LoginInfo extends CustomBaseEntity {
  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsEmail()
  email?: string;

  @Column({ type: 'int', nullable: true })
  enroll?: number;

  @Column({ type: 'datetime', nullable: true })
  dteLastLogin?: Date;

  @Column({ type: 'varchar', length: 30, nullable: true })
  ip?: string;

  @Column({ type: 'varchar', length: 512, nullable: true })
  refreshToken?: string | null;

  @Column({ type: 'datetime', nullable: true })
  refreshTokenExpires?: Date | null;

  @Column({ type: 'varchar', length: 512, nullable: true })
  accessToken?: string | null;

  @Column({ type: 'datetime', nullable: true })
  accessTokenExpires?: Date | null;

  @Column({ type: 'int', width: 50, nullable: true })
  userId?: number;

//   @ManyToOne(() => User, {
//     onDelete: 'CASCADE',
//     onUpdate: 'CASCADE',
//   })
//   user: User;
}
