"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getOrder } from "@/lib/storage";
import type { Order } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Clock,
  Package,
  Truck,
} from "lucide-react";

const STATUS_STEPS = [
  { key: "created", label: "Pedido creado", icon: CheckCircle2 },
  { key: "paid", label: "Pago pendiente", icon: Clock },
  { key: "production", label: "En produccion", icon: Package },
  { key: "shipped", label: "Enviado", icon: Truck },
  { key: "delivered", label: "Entregado", icon: CheckCircle2 },
];

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.orderId as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  useEffect(() => {
    const found = getOrder(orderId);
    setOrder(found || null);
    setLoading(false);
  }, [orderId]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-20">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded bg-muted" />
          <div className="h-64 rounded-2xl bg-muted" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-20 text-center">
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
    );
  }

  const statusIndex = STATUS_STEPS.findIndex(
    (s) => s.key === order.orderStatus,
  );

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 md:py-20">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Volver al inicio
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Pedido {order.id}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {new Date(order.createdAtISO).toLocaleDateString("es-UY", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <Badge variant="secondary" className="w-fit rounded-full px-4 py-1.5">
          Pago pendiente
        </Badge>
      </div>

      {/* Status timeline */}
      <div className="mt-8 rounded-2xl border border-border bg-background p-6">
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
          Estado del pedido
        </h3>
        <div className="mt-4 space-y-4">
          {STATUS_STEPS.map((step, i) => {
            const isActive = i <= statusIndex;
            const isCurrent = i === statusIndex;
            const Icon = step.icon;
            return (
              <div key={step.key} className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex size-8 items-center justify-center rounded-full ${
                      isActive
                        ? "bg-foreground text-background"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isActive ? (
                      <Icon className="size-4" />
                    ) : (
                      <Circle className="size-4" />
                    )}
                  </div>
                  {i < STATUS_STEPS.length - 1 && (
                    <div
                      className={`mt-1 h-6 w-px ${
                        isActive ? "bg-foreground" : "bg-muted"
                      }`}
                    />
                  )}
                </div>
                <div className="pt-1">
                  <p
                    className={`text-sm font-medium ${
                      isCurrent
                        ? "text-foreground"
                        : isActive
                          ? "text-foreground/70"
                          : "text-muted-foreground"
                    }`}
                  >
                    {step.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pack info */}
      <div className="mt-6 rounded-2xl border border-border bg-background p-6">
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
          Pack
        </h3>
        <div className="mt-3 flex items-center justify-between">
          <div>
            <p className="font-semibold text-foreground">
              {order.packSnapshot.name}
            </p>
            <p className="text-sm text-muted-foreground">
              {order.packSnapshot.quantity} imanes de 5x5 cm
            </p>
          </div>
          <p className="text-xl font-bold text-foreground">
            ${order.packSnapshot.priceUYU}{" "}
            <span className="text-xs font-normal text-muted-foreground">
              UYU
            </span>
          </p>
        </div>
      </div>

      {/* Customer */}
      <div className="mt-6 rounded-2xl border border-border bg-background p-6">
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
          Datos de contacto
        </h3>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Nombre</dt>
            <dd className="font-medium text-foreground">
              {order.customer.name}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Email</dt>
            <dd className="font-medium text-foreground">
              {order.customer.email}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Celular</dt>
            <dd className="font-medium text-foreground">
              {order.customer.phone}
            </dd>
          </div>
        </dl>
      </div>

      {/* Delivery */}
      <div className="mt-6 rounded-2xl border border-border bg-background p-6">
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
          Entrega
        </h3>
        <div className="mt-3 text-sm">
          {order.delivery.type === "retiro" ? (
            <p className="text-foreground">Retiro en Chuy</p>
          ) : (
            <div className="space-y-1">
              <p className="font-medium text-foreground">
                Envio nacional (DAC)
              </p>
              <p className="text-muted-foreground">
                {order.delivery.address?.street}, {order.delivery.address?.city}
                , {order.delivery.address?.state}
              </p>
              <p className="text-xs text-muted-foreground">
                Costo de envio a coordinar
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Notes */}
      {order.notes && (
        <div className="mt-6 rounded-2xl border border-border bg-background p-6">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
            Observaciones
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">{order.notes}</p>
        </div>
      )}

      {/* Photos */}
      <div className="mt-6 rounded-2xl border border-border bg-background p-6">
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
          Fotos ({order.images.length})
        </h3>
        <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
          {order.images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setExpandedImage(img.url || null)}
              className="aspect-square overflow-hidden rounded-lg border border-border transition-opacity hover:opacity-80"
            >
              <img
                src={img.url}
                alt={`Foto ${i + 1}`}
                className="size-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Image expand dialog */}
      <Dialog
        open={!!expandedImage}
        onOpenChange={() => setExpandedImage(null)}
      >
        <DialogContent className="max-w-md p-2">
          <DialogTitle className="sr-only">Vista ampliada de foto</DialogTitle>
          {expandedImage && (
            <img
              src={expandedImage}
              alt="Foto ampliada"
              className="w-full rounded-xl"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
