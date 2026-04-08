"use client"

import { Suspense } from "react"
import { PedidoWizard } from "@/components/pedido/pedido-wizard"

export default function PedidoPage() {
  return (
    <Suspense fallback={
      <div className="mx-auto max-w-3xl px-6 py-16">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded bg-muted" />
          <div className="h-4 w-full rounded bg-muted" />
          <div className="h-64 w-full rounded-2xl bg-muted" />
        </div>
      </div>
    }>
      <PedidoWizard />
    </Suspense>
  )
}
