import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import type { Relation } from "typeorm";
import { Vehicle } from "./Vehicle";

@Entity("fines")
export class Fine {
  @PrimaryGeneratedColumn({ name: "fine_id" })
  fineId: number;

  @Column({ name: "vehicle_id", type: "int" })
  vehicleId: number;

  @Column({ name: "violation_date", type: "datetime" })
  violationDate: Date;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  amount: string;

  @Column({ name: "article_number", type: "varchar", length: 50 })
  articleNumber: string;

  @Column({ type: "varchar", length: 50, default: "unpaid" })
  status: string;

  @ManyToOne(() => Vehicle, (v) => v.fines, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "vehicle_id" })
  vehicle: Relation<Vehicle>;
}