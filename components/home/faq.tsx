import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Como es el envio?",
    a: "Ofrecemos retiro gratis en Chuy y envio nacional por DAC. El costo de envio se coordina al confirmar el pedido.",
  },
  {
    q: "Cuanto tarda la produccion?",
    a: "La produccion es rapida. Una vez confirmado el pago, coordinamos los tiempos por WhatsApp. Generalmente entre 24 a 48 horas habiles.",
  },
  {
    q: "Que calidad tienen los imanes?",
    a: "Impresion de alta calidad sobre material magnetico flexible de 5x5 cm. Colores vibrantes y durables.",
  },
  {
    q: "Puedo repetir la misma foto?",
    a: "Si! Podes duplicar cualquier foto dentro de tu pack las veces que necesites hasta completar la cantidad.",
  },
  {
    q: "Aceptan devoluciones?",
    a: "Al ser productos personalizados no aceptamos devoluciones, salvo defectos de impresion. Por eso te pedimos que revises bien las fotos antes de confirmar.",
  },
];

export function FAQ() {
  return (
    <section className="border-t border-border bg-secondary/30">
      <div className="mx-auto max-w-3xl px-6 py-20 md:py-28">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl text-balance">
            Preguntas frecuentes
          </h2>
        </div>

        <Accordion type="single" collapsible className="mt-10">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`faq-${i}`}>
              <AccordionTrigger className="text-left text-sm font-medium">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
