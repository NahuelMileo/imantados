import { Upload, Crop, Package } from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "1. Elegi tu pack",
    description:
      "Selecciona la cantidad de imanes que quieras: 3, 6, 12 o 18 unidades.",
  },
  {
    icon: Crop,
    title: "2. Subí tus fotos",
    description:
      "Subi tus imagenes favoritas.",
  },
  {
    icon: Package,
    title: "3. Recibí tus imanes",
    description:
      "Ofrecemos retiro gratis en Chuy y envio nacional por DAC. El costo de envio se coordina al confirmar el pedido.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="como-funciona"
      className="border-t border-border bg-secondary/30"
    >
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl text-balance">
            Como funciona
          </h2>
          <p className="mt-3 text-muted-foreground">
            En tres simples pasos tenes tus imanes listos.
          </p>
        </div>

        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.title}
              className="flex flex-col items-center rounded-2xl border border-border bg-background p-8 text-center shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex size-14 items-center justify-center rounded-2xl bg-foreground text-background">
                <step.icon className="size-6" />
              </div>
              <h3 className="mt-6 text-lg font-semibold text-foreground">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
