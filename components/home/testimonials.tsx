const testimonials = [
  {
    name: "Maria G.",
    text: "Increibles! Los imanes quedaron hermosos, la calidad de impresion es excelente. Los regale y encantaron.",
  },
  {
    name: "Juan P.",
    text: "Super facil el proceso. Subi las fotos, recorte y en pocos dias los tenia en casa. 100% recomendado.",
  },
  {
    name: "Lucia R.",
    text: "Pedi el pack de 50 para un cumple de 15 y fueron el souvenir perfecto. Todos se los llevaron felices.",
  },
];

export function Testimonials() {
  return (
    <section className="border-t border-border">
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl text-balance">
            Lo que dicen nuestros clientes
          </h2>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="flex flex-col rounded-2xl border border-border bg-background p-6 shadow-sm"
            >
              <p className="flex-1 text-sm leading-relaxed text-muted-foreground italic">
                &ldquo;{t.text}&rdquo;
              </p>
              <p className="mt-4 text-sm font-semibold text-foreground">
                {t.name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
