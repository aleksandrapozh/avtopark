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

@Entity("refuelings")
export class Refueling {
  @PrimaryGeneratedColumn({ name: "refueling_id" })
  refuelingId: number;

  @Column({ name: "vehicle_id", type: "int" })
  vehicleId: number;

  @Column({ name: "driver_id", type: "int" })
  driverId: number;

  @Column({ name: "refueling_date", type: "datetime" })
  refuelingDate: Date;

  @Column({ name: "fuel_amount", type: "decimal", precision: 10, scale: 2 })
  fuelAmount: string;

  @Column({ name: "price_per_liter", type: "decimal", precision: 10, scale: 2 })
  pricePerLiter: string;

  @Column({ name: "total_cost", type: "decimal", precision: 10, scale: 2 })
  totalCost: string;

  @Column({ name: "fuel_type", type: "varchar", length: 20 })
  fuelType: string;

  @ManyToOne(() => Vehicle, (v) => v.refuelings, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "vehicle_id" })
  vehicle: Relation<Vehicle>;

  @ManyToOne(() => Driver, (d) => d.refuelings, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "driver_id" })
  driver: Relation<Driver>;
}