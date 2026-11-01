import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import type { Relation } from "typeorm";
import { Vehicle } from "./Vehicle";
import { Part } from "./Part";

@Entity("maintenance")
export class Maintenance {
  @PrimaryGeneratedColumn({ name: "maintenance_id" })
  maintenanceId: number;

  @Column({ name: "vehicle_id", type: "int" })
  vehicleId: number;

  @Column({ name: "part_id", type: "int" })
  partId: number;

  @Column({ name: "maintenance_date", type: "date" })
  maintenanceDate: string;

  @Column({ name: "work_type", type: "varchar", length: 100 })
  workType: string;

  @Column({ name: "parts_quantity", type: "int", default: 1 })
  partsQuantity: number;

  @Column({ name: "total_cost", type: "decimal", precision: 10, scale: 2 })
  totalCost: string;

  @Column({ name: "mechanic_notes", type: "text", nullable: true, default: null })
  mechanicNotes: string | null;

  @Column({ type: "varchar", length: 50, default: "in_progress" })
  status: string; // in_progress | completed

  @ManyToOne(() => Vehicle, (v) => v.maintenances, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "vehicle_id" })
  vehicle: Relation<Vehicle>;

  @ManyToOne(() => Part, (p) => p.maintenances, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "part_id" })
  part: Relation<Part>;
}