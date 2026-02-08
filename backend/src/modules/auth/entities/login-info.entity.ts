export class Auth {}
import { IsEmail, IsNotEmpty } from 'class-validator';
import { CustomBaseEntity } from 'src/common/entity/custom-base.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';

@Entity('tbl_Login_Info')
export class LoginInfo extends CustomBaseEntity {
  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsEmail()
  email?: string;

  @Column({ type: 'timestamp', nullable: true })
  dte_Last_Login?: Date;

  @Column({ type: 'varchar', length: 30, nullable: true })
  ip?: string;

  @Column({ type: 'varchar', length: 512, nullable: true })
  refresh_token?: string | null;

  @Column({ type: 'timestamp', nullable: true })
  refresh_token_expires?: Date | null;

  @Column({ type: 'varchar', length: 512, nullable: true })
  access_token?: string | null;

  @Column({ type: 'timestamp', nullable: true })
  access_token_expires?: Date | null;

  @Column({ type: 'int', width: 50, nullable: true })
  user_Id?: number;

  @ManyToOne(() => User, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  user: User;
  // Add more properties as needed
}
