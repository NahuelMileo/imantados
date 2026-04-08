import Link from "next/link";
import { MessageCircle, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-foreground text-background">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <h3 className="text-lg font-semibold">Imantados</h3>
            <p className="mt-2 text-sm text-background/70 leading-relaxed">
              Tus recuerdos, en imanes premium. Imanes personalizados de 5x5 cm
              con la mejor calidad de impresion.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-background/50">
              Links
            </h4>
            <ul className="mt-3 flex flex-col gap-2">
              <li>
                <Link
                  href="/"
                  className="text-sm text-background/70 hover:text-background transition-colors"
                >
                  Inicio
                </Link>
              </li>
              <li>
                <Link
                  href="/packs"
                  className="text-sm text-background/70 hover:text-background transition-colors"
                >
                  Packs
                </Link>
              </li>
              <li>
                <Link
                  href="/contacto"
                  className="text-sm text-background/70 hover:text-background transition-colors"
                >
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-background/50">
              Contacto
            </h4>
            <ul className="mt-3 flex flex-col gap-3">
              <li>
                <a
                  href="mailto:imantadoschuy@gmail.com"
                  className="flex items-center gap-2 text-sm text-background/70 hover:text-background transition-colors"
                >
                  <Mail className="size-4" />
                  imantadoschuy@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/59899000000?text=Hola!%20Quiero%20consultar%20sobre%20imanes%20personalizados"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-background/70 hover:text-background transition-colors"
                >
                  <MessageCircle className="size-4" />
                  WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-background/10 pt-6 text-center text-xs text-background/40">
          &copy; {new Date().getFullYear()} Imantados. Todos los derechos
          reservados.
        </div>
      </div>
    </footer>
  );
}
