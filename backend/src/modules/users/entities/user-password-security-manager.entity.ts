import { CustomBaseEntity } from 'src/common/entity/custom-base.entity';
import { Column, Entity, OneToOne } from 'typeorm';
import { User } from './user.entity';

@Entity('tbl_User_Password_Security_Manager')
export class UserPasswordSecurityManager extends CustomBaseEntity {
  @Column({ type: 'varchar', length: 512, nullable: true, select: false })
  decryptedPassword?: string;

  @Column({ type: 'int', nullable: false })
  userId!: number;

  @OneToOne(() => User, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  user: User;
}
