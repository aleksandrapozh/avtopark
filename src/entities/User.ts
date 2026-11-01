import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Waybill } from "./Waybill";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn({ name: "user_id" })
  userId: number;

  @Column({ type: "varchar", length: 50, unique: true })
  login: string;

  @Column({ name: "password_hash", type: "varchar", length: 255 })
  passwordHash: string;

  @Column({ name: "last_name", type: "varchar", length: 50 })
  lastName: string;

  @Column({ name: "first_name", type: "varchar", length: 50 })
  firstName: string;

  @Column({ name: "middle_name", type: "varchar", length: 50, nullable: true, default: null })
  middleName: string | null;

  @Column({ type: "varchar", length: 50, default: "dispatcher" })
  role: string; // dispatcher | mechanic | accountant | admin

  @Column({ type: "varchar", length: 100 })
  email: string;

  @Column({ name: "is_active", type: "tinyint", default: 1 })
  isActive: number;

  @OneToMany(() => Waybill, (w) => w.user)
  waybills: Waybill[];
}