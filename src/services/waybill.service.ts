import { getDataSource, Waybill, Vehicle } from "@/lib/data-source";
import type { WaybillCreateInput, WaybillCloseInput } from "@/lib/validators/waybill";
import { In } from "typeorm";

export const waybillService = {
  // Получить список всех путевых листов с подтянутыми данными машины и водителя
  async list(): Promise<Waybill[]> {
    const ds = await getDataSource();
    return ds.getRepository(Waybill).find({
      relations: { vehicle: true, driver: true, user: true },
      order: { issueDate: "DESC", waybillId: "DESC" },
    });
  },

  async byId(id: number): Promise<Waybill | null> {
    const ds = await getDataSource();
    return ds.getRepository(Waybill).findOne({
      where: { waybillId: id },
      relations: { vehicle: true, driver: true, user: true },
    });
  },

  // Создание (выписка) путевого листа
  async create(input: WaybillCreateInput, userId: number): Promise<Waybill> {
    const ds = await getDataSource();
    const vehicleRepo = ds.getRepository(Vehicle);
    const waybillRepo = ds.getRepository(Waybill);

    // Проверяем, что машина не в рейсе
    const vehicle = await vehicleRepo.findOne({ where: { vehicleId: input.vehicleId } });
    if (!vehicle) throw new Error("Автомобиль не найден");
    if (vehicle.status === "on_trip") {
      throw new Error("Этот автомобиль уже находится в рейсе");
    }

    // Создаём путевой лист
    const waybill = waybillRepo.create({
      vehicleId: input.vehicleId,
      driverId: input.driverId,
      userId: userId,
      waybillNumber: input.waybillNumber,
      issueDate: input.issueDate,
      startMileage: input.startMileage,
      fuelIssued: String(input.fuelIssued), // TypeORM ожидает decimal строкой
      status: "open",
    });

    // Меняем статус машины на "в рейсе"
    vehicle.status = "on_trip";
    await vehicleRepo.save(vehicle);
    
    return waybillRepo.save(waybill);
  },

  // Закрытие путевого листа (возвращение из рейса)
  async close(id: number, input: WaybillCloseInput): Promise<Waybill> {
    const ds = await getDataSource();
    const waybillRepo = ds.getRepository(Waybill);
    const vehicleRepo = ds.getRepository(Vehicle);

    const waybill = await waybillRepo.findOne({ where: { waybillId: id } });
    if (!waybill) throw new Error("Путевой лист не найден");
    if (waybill.status === "closed") throw new Error("Путевой лист уже закрыт");

    // Проверка: конечный пробег должен быть больше начального
    if (input.endMileage < waybill.startMileage) {
      throw new Error("Конечный пробег не может быть меньше начального");
    }

    // Обновляем путевой лист
    waybill.endMileage = input.endMileage;
    waybill.status = "closed";
    await waybillRepo.save(waybill);

    // Возвращаем машину в статус "Готов" и обновляем её общий пробег
    const vehicle = await vehicleRepo.findOne({ where: { vehicleId: waybill.vehicleId } });
    if (vehicle) {
      vehicle.status = "available";
      vehicle.mileage = input.endMileage; // Синхронизируем одометр машины
      await vehicleRepo.save(vehicle);
    }

    return waybill;
  },
};