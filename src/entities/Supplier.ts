import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import type { Relation } from "typeorm";
import { SupplierOffer } from "./SupplierOffer";

@Entity("suppliers")
export class Supplier {
  @PrimaryGeneratedColumn({ name: "supplier_id" })
  supplierId: number;

  @Column({ name: "supplier_name", type: "varchar", length: 150 })
  supplierName: string;

  @Column({ type: "varchar", length: 12, unique: true })
  inn: string;

  @Column({ type: "varchar", length: 20 })
  phone: string;

  @Column({ type: "varchar", length: 100, nullable: true, default: null })
  email: string | null;

  @Column({ type: "varchar", length: 255 })
  address: string;

  @OneToMany(() => SupplierOffer, (o) => o.supplier)
  offers: Relation<SupplierOffer[]>;
}