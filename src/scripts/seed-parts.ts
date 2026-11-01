import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { AppDataSource, PartCategory, Part, Supplier, SupplierOffer } from "@/lib/data-source";

// Все твои категории и запчасти
const DATA = [
  {
    category: "Фильтры и технические жидкости",
    parts: [
      "Фильтр масляный", "Фильтр воздушный", "Фильтр салонный", "Фильтр топливный",
      "Моторное масло", "Масло в КПП", "Масло в АКПП", "Тормозная жидкость", "Жидкость ГУР", "Антифриз",
      "Свечи зажигания", "Свечи накаливания", "Ремень ГРМ", "Ролик ГРМ", "Помпа", "Ремень генератора", "Ролик натяжителя"
    ]
  },
  {
    category: "Тормозная система",
    parts: [
      "Тормозные колодки передние", "Тормозные колодки задние", "Тормозные диски", "Барабаны",
      "Тормозные шланги", "Трубки тормозные", "Ремкомплект суппорта", "Датчик износа колодок",
      "Блок управления ABS", "Датчик ABS"
    ]
  },
  {
    category: "Подвеска и рулевое управление",
    parts: [
      "Амортизаторы передние", "Амортизаторы задние", "Опорные подшипники", "Сайлентблоки рычагов",
      "Шаровые опоры", "Стойки стабилизатора", "Втулки стабилизатора", "Рулевые наконечники",
      "Рулевые тяги", "Пневмобаллоны", "Компрессор пневмоподвески"
    ]
  },
  {
    category: "Двигатель и выхлопная система",
    parts: [
      "Прокладка клапанной крышки", "Прокладка ГБЦ", "Прокладка поддона", "Сальники",
      "Поршни", "Кольца", "Вкладыши", "Клапаны", "Термостат", "Водяной насос", "Радиатор охлаждения",
      "Патрубки", "Катализатор", "Гофра глушителя", "Лямбда-зонд"
    ]
  },
  {
    category: "Электрооборудование",
    parts: [
      "Стартер", "Генератор", "Диодный мост", "Щетки генератора", "Аккумуляторная батарея",
      "Предохранители", "Лампы фар", "Датчик коленвала", "Датчик распредвала"
    ]
  }
];

// Генератор случайных чисел
const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randPrice = (min: number, max: number) => (Math.random() * (max - min) + min).toFixed(2);

async function run() {
  await AppDataSource.initialize();
  console.log("⏳ Начинаем наполнение склада...");

  const catRepo = AppDataSource.getRepository(PartCategory);
  const partRepo = AppDataSource.getRepository(Part);
  const supplierRepo = AppDataSource.getRepository(Supplier);
  const offerRepo = AppDataSource.getRepository(SupplierOffer);

  // 1. Получаем существующих поставщиков
  const suppliers = await supplierRepo.find();
  if (suppliers.length === 0) {
    console.log("❌ Сначала создайте хотя бы одного поставщика!");
    process.exit(1);
  }

  let partCounter = 1;

  // 2. Проходимся по категориям
  for (const group of DATA) {
    // Создаем категорию (или находим существующую)
    let category = await catRepo.findOne({ where: { name: group.category } });
    if (!category) {
      category = await catRepo.save(catRepo.create({ name: group.category }));
      console.log(`📁 Создана категория: ${group.category}`);
    }

    // 3. Создаем запчасти в этой категории
    for (const partName of group.parts) {
      // Определяем единицы измерения и размер комплекта
      let unit = "шт";
      let packSize = 1;
      
      if (partName.includes("Масло") || partName.includes("жидкость") || partName.includes("Антифриз")) {
        unit = "л";
      }
      if (partName.includes("Свечи") || partName.includes("Колодки") || partName.includes("Амортизаторы") || partName.includes("Поршни") || partName.includes("Кольца") || partName.includes("Клапаны")) {
        packSize = 4; // Обычно продаются комплектами
      }
      if (partName.includes("Диски") || partName.includes("Барабаны") || partName.includes("Шаровые") || partName.includes("Наконечники")) {
        packSize = 2; // Парные детали
      }

      const partNumber = `ART-${String(partCounter).padStart(4, "0")}`;
      partCounter++;

      // Проверяем, нет ли уже такой запчасти
      let part = await partRepo.findOne({ where: { partName } });
      
      if (!part) {
        part = await partRepo.save(partRepo.create({
          categoryId: category.categoryId,
          partNumber,
          partName,
          unit,
          packSize
        }));
      }

      // 4. Раскидываем запчасть по поставщикам (создаем прайс-листы)
      // Каждый поставщик с вероятностью 70% имеет эту запчасть
      for (const supplier of suppliers) {
        if (Math.random() > 0.3) {
          const existingOffer = await offerRepo.findOne({ 
            where: { supplierId: supplier.supplierId, partId: part.partId } 
          });

          if (!existingOffer) {
            // Генерируем случайную цену (от 10 до 500 руб) и остаток (иногда 0 для дефицита)
            const price = partName.includes("Масло") ? randPrice(15, 40) : randPrice(10, 300);
            const quantity = Math.random() > 0.2 ? rand(2, 50) : 0; // 20% шанс, что нет в наличии

            await offerRepo.save(offerRepo.create({
              supplierId: supplier.supplierId,
              partId: part.partId,
              price,
              quantity
            }));
          }
        }
      }
    }
  }

  console.log("✅ Склад успешно заполнен! Запчастей и цен добавлено.");
  await AppDataSource.destroy();
}

run().catch(e => { console.error(e); process.exit(1); });