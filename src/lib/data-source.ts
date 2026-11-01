import "reflect-metadata";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { DataSource } from "typeorm";
import { User } from "@/entities/User";
import { Driver } from "@/entities/Driver";
import { Vehicle } from "@/entities/Vehicle";
import { Waybill } from "@/entities/Waybill";
import { Refueling } from "@/entities/Refueling";
import { Fine } from "@/entities/Fine";
import { Supplier } from "@/entities/Supplier";
import { Part } from "@/entities/Part";
import { Maintenance } from "@/entities/Maintenance";
import { PartCategory } from "@/entities/PartCategory";
import { StockMovement } from "@/entities/StockMovement";
import { SupplierOffer } from "@/entities/SupplierOffer"; // <--- НОВОЕ

export { 
  User, Driver, Vehicle, Waybill, Refueling, Fine, Supplier, Part, Maintenance,
  PartCategory, StockMovement, SupplierOffer 
};

declare global {
  var __dataSource: DataSource | undefined;
}

function createDataSource(): DataSource {
  return new DataSource({
    type: "mysql",
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT ?? 3306),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: false,
    logging: ["error", "warn"],
    entities: [
      User, Driver, Vehicle, Waybill, Refueling, 
      Fine, Supplier, Part, Maintenance,
      PartCategory, StockMovement, SupplierOffer
    ],
    charset: "utf8mb4_unicode_ci",
  });
}

export const AppDataSource = global.__dataSource ?? createDataSource();
if (process.env.NODE_ENV !== "production") {
  global.__dataSource = AppDataSource;
}

export async function getDataSource(): Promise<DataSource> {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  return AppDataSource;
}