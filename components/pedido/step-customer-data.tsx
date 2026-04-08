"use client"

import type { CustomerData, DeliveryData } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { toast } from "sonner"

interface Props {
  customer: CustomerData
  setCustomer: (c: CustomerData) => void
  delivery: DeliveryData
  setDelivery: (d: DeliveryData) => void
  notes: string
  setNotes: (n: string) => void
  onNext: () => void
  onBack: () => void
}

export function StepCustomerData({
  customer,
  setCustomer,
  delivery,
  setDelivery,
  notes,
  setNotes,
  onNext,
  onBack,
}: Props) {
  const validate = () => {
    if (!customer.name.trim()) {
      toast.error("Completa tu nombre.")
      return false
    }
    if (!customer.email.trim() || !customer.email.includes("@")) {
      toast.error("Ingresa un email valido.")
      return false
    }
    if (!customer.phone.trim()) {
      toast.error("Completa tu celular.")
      return false
    }
    if (delivery.type === "envio") {
      if (
        !delivery.address?.street?.trim() ||
        !delivery.address?.city?.trim() ||
        !delivery.address?.state?.trim()
      ) {
        toast.error("Completa la direccion de envio.")
        return false
      }
    }
    return true
  }

  const handleNext = () => {
    if (validate()) onNext()
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground">
        Datos de entrega y contacto
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Ingresa tus datos para coordinar la entrega.
      </p>

      <div className="mt-8 space-y-6">
        {/* Customer info */}
        <div className="rounded-2xl border border-border bg-background p-6 space-y-4">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
            Tus datos
          </h3>
          <div className="space-y-3">
            <div>
              <Label htmlFor="name">Nombre completo</Label>
              <Input
                id="name"
                value={customer.name}
                onChange={(e) =>
                  setCustomer({ ...customer, name: e.target.value })
                }
                placeholder="Tu nombre"
                className="mt-1.5 rounded-xl"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={customer.email}
                onChange={(e) =>
                  setCustomer({ ...customer, email: e.target.value })
                }
                placeholder="tu@email.com"
                className="mt-1.5 rounded-xl"
              />
            </div>
            <div>
              <Label htmlFor="phone">Celular</Label>
              <Input
                id="phone"
                type="tel"
                value={customer.phone}
                onChange={(e) =>
                  setCustomer({ ...customer, phone: e.target.value })
                }
                placeholder="+598 99 000 000"
                className="mt-1.5 rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Delivery */}
        <div className="rounded-2xl border border-border bg-background p-6 space-y-4">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
            Entrega
          </h3>
          <RadioGroup
            value={delivery.type}
            onValueChange={(val: "retiro" | "envio") =>
              setDelivery({
                type: val,
                shippingNote: "DAC a coordinar",
                address:
                  val === "envio"
                    ? delivery.address || { street: "", city: "", state: "" }
                    : undefined,
              })
            }
          >
            <div className="flex items-center gap-3">
              <RadioGroupItem value="retiro" id="retiro" />
              <Label htmlFor="retiro" className="cursor-pointer">
                Retiro en Chuy
              </Label>
            </div>
            <div className="flex items-center gap-3">
              <RadioGroupItem value="envio" id="envio" />
              <Label htmlFor="envio" className="cursor-pointer">
                Envio nacional (DAC)
              </Label>
            </div>
          </RadioGroup>

          {delivery.type === "envio" && (
            <div className="space-y-3 rounded-xl border border-border bg-secondary/20 p-4">
              <p className="text-xs text-muted-foreground">
                Costo de envio a coordinar
              </p>
              <div>
                <Label htmlFor="street">Direccion</Label>
                <Input
                  id="street"
                  value={delivery.address?.street || ""}
                  onChange={(e) =>
                    setDelivery({
                      ...delivery,
                      address: {
                        ...delivery.address!,
                        street: e.target.value,
                      },
                    })
                  }
                  placeholder="Calle y numero"
                  className="mt-1.5 rounded-xl"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label htmlFor="city">Ciudad</Label>
                  <Input
                    id="city"
                    value={delivery.address?.city || ""}
                    onChange={(e) =>
                      setDelivery({
                        ...delivery,
                        address: {
                          ...delivery.address!,
                          city: e.target.value,
                        },
                      })
                    }
                    placeholder="Ciudad"
                    className="mt-1.5 rounded-xl"
                  />
                </div>
                <div>
                  <Label htmlFor="state">Departamento</Label>
                  <Input
                    id="state"
                    value={delivery.address?.state || ""}
                    onChange={(e) =>
                      setDelivery({
                        ...delivery,
                        address: {
                          ...delivery.address!,
                          state: e.target.value,
                        },
                      })
                    }
                    placeholder="Departamento"
                    className="mt-1.5 rounded-xl"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="rounded-2xl border border-border bg-background p-6 space-y-3">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
            Observaciones
          </h3>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Algo que quieras agregar? (opcional)"
            className="rounded-xl"
            rows={3}
          />
        </div>
      </div>

      {/* Production note */}
      <p className="mt-6 text-center text-xs text-muted-foreground">
        Produccion rapida, coordinamos por WhatsApp.
      </p>

      {/* Navigation */}
      <div className="mt-8 flex items-center justify-between">
        <Button variant="outline" onClick={onBack} className="rounded-2xl">
          <ArrowLeft className="mr-2 size-4" />
          Anterior
        </Button>
        <Button onClick={handleNext} className="rounded-2xl">
          Siguiente
          <ArrowRight className="ml-2 size-4" />
        </Button>
      </div>
    </div>
  )
}
