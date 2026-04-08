export function Gallery() {
  // Placeholder gallery — replace with real customer images
  const placeholders = Array.from({ length: 6 }, (_, i) => i + 1)

  return (
    <section className="border-t border-border bg-secondary/30">
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl text-balance">
            Galeria de ejemplos
          </h2>
          <p className="mt-3 text-muted-foreground">
            Asi quedan los imanes personalizados de nuestros clientes.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-3">
          {placeholders.map((n) => (
            <div
              key={n}
              className="aspect-square rounded-2xl border border-border bg-muted flex items-center justify-center"
            >
              <span className="text-sm text-muted-foreground">
                Ejemplo {n}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
