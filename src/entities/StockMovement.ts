import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, CreateDateColumn } from "typeorm";
import type { Relation } from "typeorm";
import { Part } from "./Part";
import { User } from "./User";
import { Supplier } from "./Supplier";

@Entity("stock_movements")
export class StockMovement {
  @PrimaryGeneratedColumn({ name: "movement_id" })
  movementId: number;

  @Column({ name: "part_id", type: "int" })
  partId: number;

  @Column({ name: "user_id", type: "int" })
  userId: number;

  @Column({ name: "supplier_id", type: "int", nullable: true })
  supplierId: number | null;

  @Column({ type: "varchar", length: 50 })
  type: string;

  @Column({ type: "int" })
  quantity: number;

  @Column({ type: "varchar", length: 100, nullable: true })
  reason: string | null;

  @Column({ type: "text", nullable: true })
  comment: string | null;

  @CreateDateColumn({ name: "created_at", type: "datetime" })
  createdAt: Date;

  @ManyToOne(() => Part, { onDelete: "CASCADE" })
  @JoinColumn({ name: "part_id" })
  part: Relation<Part>;

  @ManyToOne(() => User, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "user_id" })
  user: Relation<User>;

  @ManyToOne(() => Supplier, { onDelete: "SET NULL", nullable: true })
  @JoinColumn({ name: "supplier_id" })
  supplier: Relation<Supplier> | null;
}