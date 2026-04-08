"use client";

import { useState } from "react";
import type { OrderImage, CustomerData, DeliveryData, Pack } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Loader2 } from "lucide-react";

interface Props {
  pack: Pack;
  images: OrderImage[];
  customer: CustomerData;
  delivery: DeliveryData;
  notes: string;
  onBack: () => void;
  onSubmit: () => Promise<void>;
  submitting: boolean;
}

export function StepConfirmation({
  pack,
  images,
  customer,
  delivery,
  notes,
  onBack,
  onSubmit,
  submitting,
}: Props) {
  const [confirmed, setConfirmed] = useState(false);

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground">Confirma tu pedido</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Revisa los datos antes de confirmar.
      </p>

      <div className="mt-8 space-y-6">
        {/* Pack summary */}
        <div className="rounded-2xl border border-border bg-background p-6">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
            Pack seleccionado
          </h3>
          <div className="mt-3 flex items-center justify-between">
            <div>
              <p className="font-semibold text-foreground">{pack.name}</p>
              <p className="text-sm text-muted-foreground">
                {pack.quantity} imanes de 5x5 cm
              </p>
            </div>
            <p className="text-2xl font-bold text-foreground">
              ${pack.priceUYU}{" "}
              <span className="text-sm font-normal text-muted-foreground">
                UYU
              </span>
            </p>
          </div>
        </div>

        {/* Photos preview */}
        <div className="rounded-2xl border border-border bg-background p-6">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
            Tus fotos ({images.length})
          </h3>
          <div className="mt-3 grid grid-cols-5 gap-2 sm:grid-cols-6 md:grid-cols-8">
            {images.map((img, i) => (
              <div
                key={img.id}
                className="aspect-square overflow-hidden rounded-lg border border-border"
              >
                <img
                  src={img.url}
                  alt={`Foto ${i + 1}`}
                  className="size-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Customer data */}
        <div className="rounded-2xl border border-border bg-background p-6">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
            Datos de contacto
          </h3>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Nombre</dt>
              <dd className="font-medium text-foreground">{customer.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Email</dt>
              <dd className="font-medium text-foreground">{customer.email}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Celular</dt>
              <dd className="font-medium text-foreground">{customer.phone}</dd>
            </div>
          </dl>
        </div>

        {/* Delivery */}
        <div className="rounded-2xl border border-border bg-background p-6">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
            Entrega
          </h3>
          <div className="mt-3 text-sm">
            {delivery.type === "retiro" ? (
              <p className="text-foreground">Retiro en Chuy</p>
            ) : (
              <div className="space-y-1">
                <p className="font-medium text-foreground">
                  Envio nacional (DAC)
                </p>
                <p className="text-muted-foreground">
                  {delivery.address?.street}, {delivery.address?.city},{" "}
                  {delivery.address?.state}
                </p>
                <p className="text-xs text-muted-foreground">
                  Costo de envio a coordinar
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        {notes && (
          <div className="rounded-2xl border border-border bg-background p-6">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              Observaciones
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">{notes}</p>
          </div>
        )}

        {/* Checkbox */}
        <div className="flex items-start gap-3 rounded-2xl border border-border bg-secondary/30 p-4">
          <Checkbox
            id="confirm"
            checked={confirmed}
            onCheckedChange={(v) => setConfirmed(v === true)}
            className="mt-0.5"
          />
          <label
            htmlFor="confirm"
            className="text-sm text-muted-foreground cursor-pointer leading-relaxed"
          >
            Confirmo que mis fotos estan correctas y quiero proceder con el
            pedido.
          </label>
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-8 flex items-center justify-between">
        <Button variant="outline" onClick={onBack} className="rounded-2xl">
          <ArrowLeft className="mr-2 size-4" />
          Anterior
        </Button>
        <Button
          onClick={onSubmit}
          disabled={!confirmed || submitting}
          className="rounded-2xl"
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Enviando...
            </>
          ) : (
            "Confirmar pedido"
          )}
        </Button>
      </div>

      {/* TODO: Replace "Confirmar pedido" with a real payment step (e.g. MercadoPago) */}
    </div>
  );
}
