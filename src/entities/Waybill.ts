import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import type { Relation } from "typeorm";
import { Vehicle } from "./Vehicle";
import { Driver } from "./Driver";
import { User } from "./User";

@Entity("waybills")
export class Waybill {
  @PrimaryGeneratedColumn({ name: "waybill_id" })
  waybillId: number;

  @Column({ name: "vehicle_id", type: "int" })
  vehicleId: number;

  @Column({ name: "driver_id", type: "int" })
  driverId: number;

  @Column({ name: "user_id", type: "int" })
  userId: number;

  @Column({ name: "waybill_number", type: "varchar", length: 50, unique: true })
  waybillNumber: string;

  @Column({ name: "issue_date", type: "date" })
  issueDate: string;

  @Column({ name: "start_mileage", type: "int" })
  startMileage: number;

  @Column({ name: "end_mileage", type: "int", nullable: true, default: null })
  endMileage: number | null;

  @Column({
    name: "fuel_issued",
    type: "decimal",
    precision: 10,
    scale: 2,
    default: 0,
  })
  fuelIssued: string;

  @Column({ type: "varchar", length: 50, default: "open" })
  status: string;

  @ManyToOne(() => Vehicle, (v) => v.waybills, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "vehicle_id" })
  vehicle: Relation<Vehicle>;

  @ManyToOne(() => Driver, (d) => d.waybills, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "driver_id" })
  driver: Relation<Driver>;

  @ManyToOne(() => User, (u) => u.waybills, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "user_id" })
  user: Relation<User>;
}