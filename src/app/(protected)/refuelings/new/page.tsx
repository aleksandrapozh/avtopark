"use client";

import { RefuelingForm } from "@/components/refuelings/RefuelingForm";

export default function NewRefuelingPage() {
  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Новая заправка</h1>
      <RefuelingForm />
    </div>
  );
}