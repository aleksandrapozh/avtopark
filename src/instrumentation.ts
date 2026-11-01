// Next.js вызывает эту функцию один раз при старте сервера.
// Здесь гарантированно подгружаем reflect-metadata ДО того,
// как будут загружены сущности с декораторами TypeORM.
export async function register() {
  await import("reflect-metadata");
}