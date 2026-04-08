"use client";

import { useEffect, useRef, useState } from "react";
import type { OrderImage, Pack } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Upload, Copy, X, ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

type Props = {
  pack: Pack;
  orderId: string | null;
  images: OrderImage[];
  setImages: (imgs: OrderImage[]) => void;
  onNext: () => void;
  onBack: () => void;
};

function generateId() {
  return Math.random().toString(36).substring(2, 10);
}

type PresignResponse = {
  files: { key: string; uploadUrl: string; url?: string }[];
  error?: string;
};

async function presign(
  orderId: string,
  files: File[],
): Promise<PresignResponse> {
  const res = await fetch("/api/r2/presign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      orderId,
      files: files.map((f) => ({
        originalName: f.name,
        contentType: f.type || "image/jpeg",
      })),
    }),
  });

  const data = (await res.json()) as PresignResponse;
  if (!res.ok) {
    throw new Error(data.error || "Error generando URLs de subida");
  }
  return data;
}

async function uploadOne(uploadUrl: string, file: File) {
  const putRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type || "image/jpeg" },
    body: file,
  });

  if (!putRes.ok) {
    throw new Error(`Error subiendo ${file.name} a R2`);
  }
}

export function StepUploadPhotos({
  pack,
  orderId,
  images,
  setImages,
  onNext,
  onBack,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const remaining = pack.quantity - images.length;

  const [uploading, setUploading] = useState(false);
  const [duplicating, setDuplicating] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);

  const handleFiles = async (files: FileList) => {
    if (!orderId) {
      toast.error(
        "No se pudo crear el pedido. Volvé y elegí el pack nuevamente.",
      );
      return;
    }

    const available = pack.quantity - images.length;
    if (available <= 0) {
      toast.error(`Ya tenés las ${pack.quantity} fotos necesarias.`);
      return;
    }

    const toAdd = Array.from(files).slice(0, available);

    try {
      setUploading(true);

      // 1) pedir presign (mismo orden que files)
      const presigned = await presign(orderId, toAdd);

      if (!presigned.files || presigned.files.length !== toAdd.length) {
        throw new Error("Respuesta inválida de presign");
      }

      // 2) subir a R2 (secuencial para evitar saturar, más estable)
      const newImages: OrderImage[] = [];

      for (let i = 0; i < toAdd.length; i++) {
        const file = toAdd[i];
        const p = presigned.files[i];

        await uploadOne(p.uploadUrl, file);

        // 3) guardar metadata (no base64)
        newImages.push({
          id: generateId(),
          originalName: file.name,
          key: p.key,
          url: p.url, // puede ser undefined si no tenés R2_PUBLIC_BASE_URL
          status: "uploaded",
        });
      }

      const updated = [...images, ...newImages];
      setImages(updated);
      toast.success(`${newImages.length} foto(s) subida(s)`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error subiendo fotos");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleDuplicate = async (img: OrderImage) => {
    if (images.length >= pack.quantity) {
      toast.error(`Ya tenés las ${pack.quantity} fotos necesarias.`);
      return;
    }

    try {
      setDuplicating(img.id);
      const res = await fetch("/api/uploads/duplicate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, tmpKey: img.key }),
      });

      if (!res.ok) throw new Error("Error duplicando foto");

      const dup: OrderImage = {
        ...img,
        id: generateId(),
        status: "uploaded",
      };

      setImages([...images, dup]);
      toast.success("Foto duplicada");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error duplicando foto");
    } finally {
      setDuplicating(null);
    }
  };

  const handleRemove = async (id: string) => {
    const img = images.find((i) => i.id === id);
    if (!img) return;

    try {
      setRemoving(id);
      await fetch("/api/uploads/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, tmpKey: img.key }),
      });
      setImages(images.filter((i) => i.id !== id));
    } catch {
      // best effort
    } finally {
      setRemoving(null);
    }
  };

  const canProceed = images.length === pack.quantity && !uploading;

  useEffect(() => {
    console.log(images);
  }, [images]);

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground">Subí tus fotos</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Necesitás exactamente{" "}
        <span className="font-semibold text-foreground">{pack.quantity}</span>{" "}
        fotos para el {pack.name}.
      </p>

      <div className="mt-4 rounded-2xl border border-border bg-secondary/30 p-4 text-center">
        <span className="text-3xl font-bold text-foreground">
          {images.length}
        </span>
        <span className="mx-2 text-muted-foreground">/</span>
        <span className="text-3xl font-bold text-muted-foreground">
          {pack.quantity}
        </span>
        <p className="mt-1 text-xs text-muted-foreground">fotos subidas</p>
      </div>

      {remaining > 0 && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading || !orderId}
          className="mt-6 flex w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-background p-10 transition-colors hover:border-foreground/30 hover:bg-secondary/20 focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
        >
          {uploading ? (
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          ) : (
            <Upload className="size-8 text-muted-foreground" />
          )}
          <span className="text-sm font-medium text-muted-foreground">
            {!orderId
              ? "Creando pedido..."
              : uploading
                ? "Subiendo..."
                : `Click para subir fotos (${remaining} restantes)`}
          </span>
          <span className="text-xs text-muted-foreground">JPG, PNG o WebP</span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
      />

      {images.length > 0 && (
        <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
          {images.map((img) => (
            <div
              key={img.id}
              className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-muted"
            >
              {img.url ? (
                <img
                  src={img.url}
                  alt={img.originalName}
                  className="size-full object-cover"
                />
              ) : (
                <div className="flex size-full items-center justify-center p-2 text-center text-xs text-muted-foreground">
                  Sin URL pública
                  <br />
                  (key guardada)
                </div>
              )}

              <span className="absolute bottom-1 left-1 rounded-full bg-foreground px-2 py-0.5 text-[10px] font-medium text-background">
                Subida
              </span>

              <div className="absolute top-1 right-1 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => handleDuplicate(img)}
                  className="rounded-lg bg-background/90 p-1.5 text-foreground shadow-sm hover:bg-background disabled:opacity-60"
                  title="Duplicar"
                  disabled={images.length >= pack.quantity || uploading || duplicating === img.id}
                >
                  {duplicating === img.id
                    ? <Loader2 className="size-3.5 animate-spin" />
                    : <Copy className="size-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => handleRemove(img.id)}
                  className="rounded-lg bg-background/90 p-1.5 text-foreground shadow-sm hover:bg-background disabled:opacity-60"
                  title="Eliminar"
                  disabled={uploading || removing === img.id}
                >
                  {removing === img.id
                    ? <Loader2 className="size-3.5 animate-spin" />
                    : <X className="size-3.5" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!canProceed && images.length > 0 && !uploading && (
        <p className="mt-4 text-center text-sm text-destructive">
          Debés subir exactamente {pack.quantity} fotos para este pack. Faltan{" "}
          {remaining}.
        </p>
      )}

      <div className="mt-8 flex items-center justify-between">
        <Button
          variant="outline"
          onClick={onBack}
          className="rounded-2xl"
          disabled={uploading}
        >
          <ArrowLeft className="mr-2 size-4" />
          Anterior
        </Button>
        <Button onClick={onNext} disabled={!canProceed} className="rounded-2xl">
          Siguiente
          <ArrowRight className="ml-2 size-4" />
        </Button>
      </div>
    </div>
  );
}
