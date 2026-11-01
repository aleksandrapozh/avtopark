import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import type { Relation } from "typeorm";
import { Part } from "./Part";
import { Supplier } from "./Supplier";

@Entity("supplier_offers")
export class SupplierOffer {
  @PrimaryGeneratedColumn({ name: "offer_id" })
  offerId: number;

  @Column({ name: "supplier_id", type: "int" })
  supplierId: number;

  @Column({ name: "part_id", type: "int" })
  partId: number;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  price: string;

  @Column({ type: "int", default: 0 })
  quantity: number;

  @ManyToOne(() => Supplier, (s) => s.offers, { onDelete: "CASCADE" })
  @JoinColumn({ name: "supplier_id" })
  supplier: Relation<Supplier>;

  @ManyToOne(() => Part, (p) => p.offers, { onDelete: "CASCADE" })
  @JoinColumn({ name: "part_id" })
  part: Relation<Part>;
}