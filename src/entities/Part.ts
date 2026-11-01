import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import type { Relation } from "typeorm";
import { Maintenance } from "./Maintenance";
import { PartCategory } from "./PartCategory";
import { StockMovement } from "./StockMovement";
import { SupplierOffer } from "./SupplierOffer";

@Entity("parts")
export class Part {
  @PrimaryGeneratedColumn({ name: "part_id" })
  partId: number;

  @Column({ name: "category_id", type: "int", nullable: true })
  categoryId: number | null;

  @Column({ name: "part_number", type: "varchar", length: 50 })
  partNumber: string;

  @Column({ name: "part_name", type: "varchar", length: 150 })
  partName: string;

  @Column({ type: "varchar", length: 20, default: "шт" })
  unit: string;

  @Column({ name: "pack_size", type: "int", default: 1 })
  packSize: number;

  // НАШ СКЛАД
  @Column({ type: "int", default: 0 })
  quantity: number;

  // НАША ЗАКУПОЧНАЯ ЦЕНА
  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  price: string;

  @ManyToOne(() => PartCategory, (c) => c.parts, { onDelete: "SET NULL", nullable: true })
  @JoinColumn({ name: "category_id" })
  category: Relation<PartCategory> | null;

  @OneToMany(() => Maintenance, (m) => m.part)
  maintenances: Maintenance[];

  @OneToMany(() => StockMovement, (m) => m.part)
  movements: Relation<StockMovement[]>;

  @OneToMany(() => SupplierOffer, (o) => o.part)
  offers: Relation<SupplierOffer[]>;
}