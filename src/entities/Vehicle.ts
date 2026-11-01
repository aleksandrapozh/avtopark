import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Waybill } from "./Waybill";
import { Refueling } from "./Refueling";
import { Fine } from "./Fine";
import { Maintenance } from "./Maintenance";

@Entity("vehicles")
export class Vehicle {
  @PrimaryGeneratedColumn({ name: "vehicle_id" })
  vehicleId: number;

  @Column({ name: "license_plate", type: "varchar", length: 20, unique: true })
  licensePlate: string;

  @Column({ name: "brand_model", type: "varchar", length: 100 })
  brandModel: string;

  @Column({ type: "varchar", length: 17, unique: true })
  vin: string;

  @Column({ type: "int" })
  year: number;

  @Column({ type: "int", default: 0 })
  mileage: number;

  @Column({ type: "varchar", length: 50, default: "available" })
  status: string; // available | on_trip | maintenance | repair | archived

  @OneToMany(() => Waybill, (w) => w.vehicle)
  waybills: Waybill[];

  @OneToMany(() => Refueling, (r) => r.vehicle)
  refuelings: Refueling[];

  @OneToMany(() => Fine, (f) => f.vehicle)
  fines: Fine[];

  @OneToMany(() => Maintenance, (m) => m.vehicle)
  maintenances: Maintenance[];
}