const fs = require('fs');
const path = require('path');

const filesToCreate = [
  // --- Пользователи (Шаг 12) ---
  'src/app/api/users/route.ts',
  'src/app/api/users/[id]/route.ts',
  'src/hooks/useUsers.ts',
  'src/components/users/UserForm.tsx',
  'src/app/(protected)/users/page.tsx',
  'src/app/(protected)/users/new/page.tsx',
  'src/app/(protected)/users/[id]/edit/page.tsx',

  // --- Отчеты (Шаг 13) ---
  'src/services/report.service.ts',
  'src/app/api/reports/route.ts',
  'src/app/(protected)/reports/page.tsx',

  // --- Дашборд и Главная (Шаг 14) ---
  'src/app/api/dashboard/route.ts',
  'src/app/(protected)/dashboard/page.tsx', // Этот файл уже есть, скрипт его пропустит
  'src/app/page.tsx' // Этот файл тоже уже есть
];

filesToCreate.forEach((filePath) => {
  const dir = path.dirname(filePath);
  
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Создана папка: ${dir}`);
  }
  
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, '', 'utf8');
    console.log(`📄 Создан файл: ${filePath}`);
  } else {
    console.log(`⏩ Пропущено (уже существует): ${filePath}`);
  }
});

console.log('✅ Все необходимые файлы и папки для оставшихся шагов готовы!');