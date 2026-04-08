"use client";

import { packs } from "@/lib/packs";
import type { Pack } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface Props {
  onSelect: (pack: Pack) => void;
}

export function StepSelectPack({ onSelect }: Props) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground">Elegi tu pack</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Selecciona la cantidad de imanes que necesitas.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {packs.map((pack) => (
          <button
            key={pack.id}
            onClick={() => onSelect(pack)}
            className="flex flex-col items-start rounded-2xl border border-border bg-background p-6 text-left shadow-sm transition-all hover:shadow-md hover:border-foreground/20 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <div className="flex w-full items-center justify-between">
              <span className="text-lg font-semibold text-foreground">
                {pack.name}
              </span>
              <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                {pack.quantity} uds
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold text-foreground">
              ${pack.priceUYU}{" "}
              <span className="text-sm font-normal text-muted-foreground">
                UYU
              </span>
            </p>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              {pack.description}
            </p>
            <ul className="mt-3 flex flex-col gap-1">
              {pack.bullets.slice(0, 3).map((b) => (
                <li
                  key={b}
                  className="flex items-center gap-2 text-xs text-muted-foreground"
                >
                  <Check className="size-3 shrink-0 text-foreground" />
                  {b}
                </li>
              ))}
            </ul>
          </button>
        ))}
      </div>

      <div className="mt-6 text-center">
        <Button asChild variant="ghost" size="sm">
          <a href="/contacto">Mas cantidad? Contactanos</a>
        </Button>
      </div>
    </div>
  );
}
