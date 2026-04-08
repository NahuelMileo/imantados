"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { MessageCircle, Mail, Send } from "lucide-react"
import { toast } from "sonner"

export default function ContactoPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" })
  const [sending, setSending] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) {
      toast.error("Completa todos los campos.")
      return
    }
    setSending(true)
    // Mock submit
    await new Promise((r) => setTimeout(r, 1000))
    toast.success("Mensaje enviado. Te responderemos pronto!")
    setForm({ name: "", email: "", message: "" })
    setSending(false)
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 md:py-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl text-balance">
          Contacto
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Consultas, pedidos grandes o lo que necesites.
        </p>
      </div>

      <div className="mt-12 grid gap-8 md:grid-cols-2">
        {/* Direct contact */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-background p-6">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              Escribinos por WhatsApp
            </h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              La forma mas rapida de comunicarte con nosotros. Consultas sobre
              pedidos grandes, eventos o cualquier duda.
            </p>
            <Button asChild className="mt-4 w-full rounded-2xl">
              <a
                href="https://wa.me/59899000000?text=Hola!%20Quiero%20consultar%20sobre%20imanes%20personalizados"
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="mr-2 size-4" />
                Abrir WhatsApp
              </a>
            </Button>
          </div>

          <div className="rounded-2xl border border-border bg-background p-6">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              Email
            </h3>
            <a
              href="mailto:imantadoschuy@gmail.com"
              className="mt-3 flex items-center gap-2 text-sm text-foreground hover:underline"
            >
              <Mail className="size-4 text-muted-foreground" />
              imantadoschuy@gmail.com
            </a>
          </div>
        </div>

        {/* Contact form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-2xl border border-border bg-background p-6 space-y-4">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              Formulario de contacto
            </h3>
            <div>
              <Label htmlFor="contact-name">Nombre</Label>
              <Input
                id="contact-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Tu nombre"
                className="mt-1.5 rounded-xl"
              />
            </div>
            <div>
              <Label htmlFor="contact-email">Email</Label>
              <Input
                id="contact-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="tu@email.com"
                className="mt-1.5 rounded-xl"
              />
            </div>
            <div>
              <Label htmlFor="contact-message">Mensaje</Label>
              <Textarea
                id="contact-message"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Tu consulta..."
                rows={4}
                className="mt-1.5 rounded-xl"
              />
            </div>
            <Button
              type="submit"
              disabled={sending}
              className="w-full rounded-2xl"
            >
              <Send className="mr-2 size-4" />
              {sending ? "Enviando..." : "Enviar mensaje"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
