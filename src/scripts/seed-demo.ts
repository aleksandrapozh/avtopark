import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import * as bcrypt from "bcryptjs";
import { AppDataSource } from "@/lib/data-source";
import { 
  User, Supplier, Part, Driver, Vehicle, 
  Waybill, Refueling, Fine, Maintenance 
} from "@/lib/data-source";

async function run() {
  await AppDataSource.initialize();
  console.log("⏳ Очистка старых данных...");
  
  await AppDataSource.query("SET FOREIGN_KEY_CHECKS = 0;");
  for (const table of ["maintenance", "fines", "refuelings", "waybills", "parts", "suppliers", "vehicles", "drivers", "users"]) {
    await AppDataSource.query(`TRUNCATE TABLE ${table};`);
  }
  await AppDataSource.query("SET FOREIGN_KEY_CHECKS = 1;");

  console.log("🌱 Начинаем заполнение базы...");

  // --- 1. ПОЛЬЗОВАТЕЛИ ---
  const userRepo = AppDataSource.getRepository(User);
  const passHash = await bcrypt.hash("test123", 10);
  const adminHash = await bcrypt.hash("Admin123!", 10);
  
  await userRepo.save([
    { login: "admin", passwordHash: adminHash, lastName: "Системный", firstName: "Администратор", role: "admin", email: "admin@avtopark.by", isActive: 1 },
    { login: "dispatcher1", passwordHash: passHash, lastName: "Смирнова", firstName: "Анна", role: "dispatcher", email: "disp@avtopark.by", isActive: 1 },
    { login: "mechanic1", passwordHash: passHash, lastName: "Петров", firstName: "Олег", role: "mechanic", email: "mech@avtopark.by", isActive: 1 },
    { login: "accountant1", passwordHash: passHash, lastName: "Кузнецова", firstName: "Елена", role: "accountant", email: "buh@avtopark.by", isActive: 1 },
  ]);

  // --- 2. ПОСТАВЩИКИ ---
  const supplierRepo = AppDataSource.getRepository(Supplier);
  const suppliers = await supplierRepo.save([
    { supplierName: "ООО «АвтоДеталь»", inn: "190123456", phone: "+375 (29) 111-22-33", email: "info@autodetal.by", address: "г. Минск, ул. Автомобилистов, 10" },
    { supplierName: "ИП Сидоров А.В.", inn: "191234567", phone: "+375 (33) 444-55-66", email: "sidorov@mail.by", address: "г. Гомель, ул. Советская, 5" },
    { supplierName: "ООО «БелТракСервис»", inn: "192345678", phone: "+375 (17) 222-33-44", email: "sales@beltrаk.by", address: "г. Минск, пр-т Победителей, 100" },
  ]);

  // --- 3. ЗАПЧАСТИ ---
  const partRepo = AppDataSource.getRepository(Part);
  const parts = await partRepo.save([
    { supplierId: suppliers[0].supplierId, partNumber: "FIL-001", partName: "Масляный фильтр", quantity: 45, price: "12.50" },
    { supplierId: suppliers[0].supplierId, partNumber: "FIL-002", partName: "Воздушный фильтр", quantity: 30, price: "18.00" },
    { supplierId: suppliers[1].supplierId, partNumber: "BRK-010", partName: "Тормозные колодки", quantity: 15, price: "65.00" },
    { supplierId: suppliers[1].supplierId, partNumber: "ACC-055", partName: "Аккумулятор 75Ah", quantity: 1, price: "250.00" }, // Мало!
    { supplierId: suppliers[2].supplierId, partNumber: "OIL-005", partName: "Масло моторное 5W-40", quantity: 50, price: "55.00" },
    { supplierId: suppliers[2].supplierId, partNumber: "TIR-01", partName: "Шина R17", quantity: 0, price: "320.00" }, // Нет в наличии!
  ]);

  // --- 4. ВОДИТЕЛИ ---
  const driverRepo = AppDataSource.getRepository(Driver);
  const drivers = await driverRepo.save([
    { lastName: "Иванов", firstName: "Иван", middleName: "Иванович", licenseNumber: "1234 567890", phone: "+375 (29) 123-45-67", status: "active" },
    { lastName: "Сидоров", firstName: "Петр", middleName: "Сергеевич", licenseNumber: "2345 678901", phone: "+375 (33) 234-56-78", status: "active" },
    { lastName: "Козлов", firstName: "Алексей", middleName: "Владимирович", licenseNumber: "3456 789012", phone: "+375 (44) 345-67-89", status: "vacation" },
    { lastName: "Морозов", firstName: "Дмитрий", middleName: "Анатольевич", licenseNumber: "4567 890123", phone: "+375 (25) 456-78-90", status: "active" },
    { lastName: "Волков", firstName: "Сергей", middleName: "Николаевич", licenseNumber: "5678 901234", phone: "+375 (29) 567-89-01", status: "active" },
  ]);

  // --- 5. МАШИНЫ ---
  const vehicleRepo = AppDataSource.getRepository(Vehicle);
  const vehicles = await vehicleRepo.save([
    { licensePlate: "А123ВС-7", brandModel: "ГАЗель Next", vin: "Y4KBS517XMA012345", year: 2022, mileage: 45000, status: "available" },
    { licensePlate: "В456ЕК-7", brandModel: "МАЗ-5440", vin: "Y4KBS517XMA012346", year: 2020, mileage: 120000, status: "available" },
    { licensePlate: "С789МН-7", brandModel: "Ford Transit", vin: "Y4KBS517XMA012347", year: 2023, mileage: 15000, status: "available" },
    { licensePlate: "Е321ОР-7", brandModel: "Volkswagen Passat", vin: "Y4KBS517XMA012348", year: 2019, mileage: 85000, status: "available" },
    { licensePlate: "К654ТУ-7", brandModel: "КАМАЗ-6520", vin: "Y4KBS517XMA012349", year: 2018, mileage: 210000, status: "maintenance" },
    { licensePlate: "М987АВ-7", brandModel: "Peugeot Boxer", vin: "Y4KBS517XMA012350", year: 2021, mileage: 60000, status: "available" },
  ]);

  // --- 6. ПУТЕВЫЕ ЛИСТЫ ---
  const waybillRepo = AppDataSource.getRepository(Waybill);
  await waybillRepo.save([
    // Закрытые (для отчетов)
    { vehicleId: vehicles[0].vehicleId, driverId: drivers[0].driverId, userId: 2, waybillNumber: "ПЛ-1001", issueDate: "2026-09-01", startMileage: 40000, endMileage: 40500, fuelIssued: "50.00", status: "closed" },
    { vehicleId: vehicles[1].vehicleId, driverId: drivers[1].driverId, userId: 2, waybillNumber: "ПЛ-1002", issueDate: "2026-09-05", startMileage: 115000, endMileage: 116200, fuelIssued: "150.00", status: "closed" },
    { vehicleId: vehicles[2].vehicleId, driverId: drivers[3].driverId, userId: 2, waybillNumber: "ПЛ-1003", issueDate: "2026-09-10", startMileage: 10000, endMileage: 10500, fuelIssued: "40.00", status: "closed" },
    { vehicleId: vehicles[0].vehicleId, driverId: drivers[0].driverId, userId: 2, waybillNumber: "ПЛ-1004", issueDate: "2026-10-10", startMileage: 40500, endMileage: 41000, fuelIssued: "50.00", status: "closed" },
    
    // Открытые (сейчас в рейсе)
    { vehicleId: vehicles[3].vehicleId, driverId: drivers[4].driverId, userId: 2, waybillNumber: "ПЛ-1024", issueDate: "2026-10-16", startMileage: 85000, endMileage: null, fuelIssued: "40.00", status: "open" },
    { vehicleId: vehicles[5].vehicleId, driverId: drivers[1].driverId, userId: 2, waybillNumber: "ПЛ-1025", issueDate: "2026-10-17", startMileage: 60000, endMileage: null, fuelIssued: "60.00", status: "open" },
  ]);
  
  // Обновляем статусы машин, которые в рейсе
  await vehicleRepo.update({ vehicleId: vehicles[3].vehicleId }, { status: "on_trip" });
  await vehicleRepo.update({ vehicleId: vehicles[5].vehicleId }, { status: "on_trip" });

  // --- 7. ЗАПРАВКИ ---
  const refuelingRepo = AppDataSource.getRepository(Refueling);
  await refuelingRepo.save([
    { vehicleId: vehicles[0].vehicleId, driverId: drivers[0].driverId, refuelingDate: new Date("2026-09-01T10:00:00"), fuelAmount: "40.00", pricePerLiter: "2.10", totalCost: "84.00", fuelType: "АИ-92" },
    { vehicleId: vehicles[1].vehicleId, driverId: drivers[1].driverId, refuelingDate: new Date("2026-09-05T15:30:00"), fuelAmount: "100.00", pricePerLiter: "2.15", totalCost: "215.00", fuelType: "ДТ" },
    { vehicleId: vehicles[2].vehicleId, driverId: drivers[3].driverId, refuelingDate: new Date("2026-09-10T08:00:00"), fuelAmount: "30.00", pricePerLiter: "2.15", totalCost: "64.50", fuelType: "ДТ" },
    { vehicleId: vehicles[3].vehicleId, driverId: drivers[4].driverId, refuelingDate: new Date("2026-10-16T09:00:00"), fuelAmount: "35.00", pricePerLiter: "2.20", totalCost: "77.00", fuelType: "АИ-95" },
  ]);

  // --- 8. ШТРАФЫ ---
  const fineRepo = AppDataSource.getRepository(Fine);
  await fineRepo.save([
    { vehicleId: vehicles[0].vehicleId, violationDate: new Date("2026-09-02T14:30:00"), amount: "50.00", articleNumber: "12.9 ч.2", status: "paid" },
    { vehicleId: vehicles[1].vehicleId, violationDate: new Date("2026-09-08T09:15:00"), amount: "100.00", articleNumber: "12.16 ч.1", status: "unpaid" },
    { vehicleId: vehicles[3].vehicleId, violationDate: new Date("2026-10-16T18:00:00"), amount: "25.00", articleNumber: "12.9 ч.2", status: "unpaid" },
  ]);

  // --- 9. РЕМОНТЫ ---
  const maintenanceRepo = AppDataSource.getRepository(Maintenance);
  await maintenanceRepo.save([
    { vehicleId: vehicles[0].vehicleId, partId: parts[0].partId, maintenanceDate: "2026-10-12", workType: "Плановое ТО", partsQuantity: 1, totalCost: "45.00", mechanicNotes: "Заменено масло и фильтр" },
    { vehicleId: vehicles[1].vehicleId, partId: parts[2].partId, maintenanceDate: "2026-10-14", workType: "Замена колодок", partsQuantity: 2, totalCost: "180.00", mechanicNotes: "Износ 90%" },
    { vehicleId: vehicles[4].vehicleId, partId: parts[0].partId, maintenanceDate: "2026-10-18", workType: "ТО-2", partsQuantity: 1, totalCost: "120.00", mechanicNotes: "Полное ТО, замена всех жидкостей" },
  ]);
  
  // Списываем запчасти за ремонты
  await partRepo.decrement({ partId: parts[0].partId }, "quantity", 2);
  await partRepo.decrement({ partId: parts[2].partId }, "quantity", 2);

  console.log("🎉 БАЗА УСПЕШНО ЗАПОЛНЕНА!");
  await AppDataSource.destroy();
}

run().catch((e) => {
  console.error("Ошибка:", e);
  process.exit(1);
});