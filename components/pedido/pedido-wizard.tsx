"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { packs } from "@/lib/packs";
import { saveOrder } from "@/lib/storage";
import type { Pack, OrderImage, CustomerData, DeliveryData } from "@/lib/types";
import { StepSelectPack } from "./step-select-pack";
import { StepUploadPhotos } from "./step-upload-photos";
import { StepCustomerData } from "./step-customer-data";
import { StepConfirmation } from "./step-confirmation";
import { toast } from "sonner";

const STEP_LABELS = ["Elegir pack", "Subir fotos", "Datos", "Confirmar"];

export function PedidoWizard() {
  const [orderId, setOrderId] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialPack =
    packs.find((p) => p.id === searchParams.get("pack")) || null;

  const [step, setStep] = useState(initialPack ? 1 : 0);
  const [selectedPack, setSelectedPack] = useState<Pack | null>(initialPack);
  const [images, setImages] = useState<OrderImage[]>([]);
  const [customer, setCustomer] = useState<CustomerData>({
    name: "",
    email: "",
    phone: "",
  });
  const [delivery, setDelivery] = useState<DeliveryData>({
    type: "retiro",
    shippingNote: "DAC a coordinar",
  });
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const goNext = useCallback(() => setStep((s) => Math.min(s + 1, 3)), []);
  const goBack = useCallback(() => setStep((s) => Math.max(s - 1, 0)), []);

  const handleSelectPack = useCallback(
    async (pack: Pack, navigate = true) => {
      setSelectedPack(pack);
      setImages([]);
      setOrderId(null);

      try {
        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: pack.id, quantity: 1 }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Error al crear pedido");

        setOrderId(data.id);
        if (navigate) goNext();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Error inesperado");
      }
    },
    [goNext],
  );

  const orderCreatedRef = useRef(false);

  useEffect(() => {
    if (!initialPack || orderCreatedRef.current) return;
    orderCreatedRef.current = true;
    handleSelectPack(initialPack, false);
  }, []);

  const handleSubmit = async () => {
    if (!selectedPack) return;

    if (!orderId) {
      toast.error("No se encontró el pedido. Volvé a elegir el pack.");
      return;
    }

    if (!customer.email?.includes("@")) {
      toast.error("Ingresá un email válido.");
      return;
    }

    if (images.length === 0) {
      toast.error("Subí al menos una foto.");
      return;
    }

    setSubmitting(true);

    try {
      const custRes = await fetch(`/api/orders/${orderId}/customer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerEmail: customer.email,
          customerPhone: customer.phone,
          customerName: customer.name,
        }),
      });

      const custData = await custRes.json();
      if (!custRes.ok) {
        throw new Error(custData.error || "Error guardando datos del cliente");
      }

      saveOrder({
        id: orderId,
        packId: selectedPack.id,
        packSnapshot: {
          name: selectedPack.name,
          quantity: selectedPack.quantity,
          priceUYU: selectedPack.priceUYU,
        },
        customer,
        delivery,
        notes: notes || undefined,
        images,
        createdAtISO: new Date().toISOString(),
        paymentStatus: "pending",
        orderStatus: "created",
      });

      const checkoutRes = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });

      const checkoutData = await checkoutRes.json();
      if (!checkoutRes.ok) {
        throw new Error(checkoutData.error || "Error al iniciar pago");
      }

      window.location.href = checkoutData.init_point;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 md:py-20">
      <div className="mb-10">
        <div className="flex items-center justify-between">
          {STEP_LABELS.map((label, i) => (
            <div
              key={label}
              className="flex flex-1 flex-col items-center gap-2"
            >
              <div
                className={`flex size-8 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                  i <= step
                    ? "bg-foreground text-background"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {i < step ? (
                  <svg
                    className="size-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <span
                className={`hidden text-xs sm:block ${
                  i <= step
                    ? "font-medium text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {label}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-4 h-1 w-full rounded-full bg-muted">
          <div
            className="h-1 rounded-full bg-foreground transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      {step === 0 && <StepSelectPack onSelect={handleSelectPack} />}

      {step === 1 && selectedPack && (
        <StepUploadPhotos
          pack={selectedPack}
          orderId={orderId}
          images={images}
          setImages={setImages}
          onNext={goNext}
          onBack={goBack}
        />
      )}

      {step === 2 && (
        <StepCustomerData
          customer={customer}
          setCustomer={setCustomer}
          delivery={delivery}
          setDelivery={setDelivery}
          notes={notes}
          setNotes={setNotes}
          onNext={goNext}
          onBack={goBack}
        />
      )}

      {step === 3 && selectedPack && (
        <StepConfirmation
          pack={selectedPack}
          images={images}
          customer={customer}
          delivery={delivery}
          notes={notes}
          onBack={goBack}
          onSubmit={handleSubmit}
          submitting={submitting}
        />
      )}
    </div>
  );
}
