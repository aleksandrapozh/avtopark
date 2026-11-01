import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import type { Relation } from "typeorm";
import { Part } from "./Part";

@Entity("part_categories")
export class PartCategory {
  @PrimaryGeneratedColumn({ name: "category_id" })
  categoryId: number;

  @Column({ type: "varchar", length: 100, unique: true })
  name: string;

  @OneToMany(() => Part, (p) => p.category)
  parts: Relation<Part[]>;
}