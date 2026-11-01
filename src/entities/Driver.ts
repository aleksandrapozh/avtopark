import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Waybill } from "./Waybill";
import { Refueling } from "./Refueling";

@Entity("drivers")
export class Driver {
  @PrimaryGeneratedColumn({ name: "driver_id" })
  driverId: number;

  @Column({ name: "last_name", type: "varchar", length: 50 })
  lastName: string;

  @Column({ name: "first_name", type: "varchar", length: 50 })
  firstName: string;

  @Column({ name: "middle_name", type: "varchar", length: 50, nullable: true, default: null })
  middleName: string | null;

  @Column({ name: "license_number", type: "varchar", length: 50, unique: true })
  licenseNumber: string;

  @Column({ type: "varchar", length: 20 })
  phone: string;

  @Column({ type: "varchar", length: 50, default: "active" })
  status: string;

  @OneToMany(() => Waybill, (w) => w.driver)
  waybills: Waybill[];

  @OneToMany(() => Refueling, (r) => r.driver)
  refuelings: Refueling[];
}