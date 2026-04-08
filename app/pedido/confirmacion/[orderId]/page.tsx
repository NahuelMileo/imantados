"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { getOrder } from "@/lib/storage"
import type { Order } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Home, FileText } from "lucide-react"

export default function ConfirmacionPage() {
  const params = useParams()
  const orderId = params.orderId as string
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const found = getOrder(orderId)
    setOrder(found || null)
    setLoading(false)
  }, [orderId])

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-20 text-center">
        <div className="animate-pulse space-y-4">
          <div className="mx-auto h-16 w-16 rounded-full bg-muted" />
          <div className="mx-auto h-6 w-48 rounded bg-muted" />
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-20 text-center">
        <h1 className="text-2xl font-bold text-foreground">
          Pedido no encontrado
        </h1>
        <p className="mt-2 text-muted-foreground">
          No encontramos un pedido con ID: {orderId}
        </p>
        <Button asChild className="mt-6 rounded-2xl">
          <Link href="/">Volver al inicio</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-16 md:py-24">
      <div className="flex flex-col items-center text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-foreground text-background">
          <CheckCircle2 className="size-8" />
        </div>
        <h1 className="mt-6 text-3xl font-bold text-foreground">
          Pedido recibido
        </h1>
        <p className="mt-3 text-muted-foreground">
          Tu pedido ha sido registrado exitosamente.
        </p>

        <div className="mt-6 rounded-2xl border border-border bg-secondary/30 px-6 py-4">
          <p className="text-sm text-muted-foreground">ID del pedido</p>
          <p className="mt-1 text-lg font-mono font-bold text-foreground">
            {order.id}
          </p>
        </div>

        <Badge
          variant="secondary"
          className="mt-4 rounded-full px-4 py-1.5 text-xs"
        >
          Pago pendiente — a coordinar
        </Badge>

        <div className="mt-8 rounded-2xl border border-border bg-background p-6 text-left w-full">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
            Proximos pasos
          </h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>1. Te contactaremos por WhatsApp o email para coordinar el pago.</li>
            <li>2. Una vez confirmado, comenzamos la produccion.</li>
            <li>
              3.{" "}
              {order.delivery.type === "retiro"
                ? "Te avisamos cuando esten listos para retirar en Chuy."
                : "Coordinamos el envio por DAC a tu direccion."}
            </li>
          </ul>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild className="rounded-2xl">
            <Link href="/">
              <Home className="mr-2 size-4" />
              Volver al inicio
            </Link>
          </Button>
          <Button asChild variant="outline" className="rounded-2xl">
            <Link href={`/pedido/${order.id}`}>
              <FileText className="mr-2 size-4" />
              Ver mi pedido
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
