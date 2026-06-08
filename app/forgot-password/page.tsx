"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const sendResetEmail = async () => {
    if (!email.trim()) {
      toast.error("Ingrese su correo electrónico");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "https://polla.incarpalm.com.ec/reset-password",
    });

    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success(
      "Se envió un enlace para restablecer su contraseña"
    );
  };

  return (
    <div className="min-h-screen flex justify-center items-center relative overflow-hidden p-4 bg-animated-gradient">

      <Card className="max-w-[450px] p-8 z-10">
        <h1 className="text-3xl font-bold text-center text-[var(--primary)] mb-2">
          Recuperar <span className="text-[var(--accent)]">Contraseña</span>
        </h1>

        <p className="text-center text-[var(--text-secondary)] mb-8">
          Ingrese su correo y le enviaremos un enlace de recuperación.
        </p>

        <Input
          label="Correo electrónico"
          type="email"
          placeholder="correo@empresa.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Button
          onClick={sendResetEmail}
          disabled={loading}
          className="mt-6"
        >
          {loading
            ? "Enviando..."
            : "Enviar enlace"}
        </Button>

        <div className="text-center mt-6">
          <Link
            href="/login"
            className="text-[var(--primary)]"
          >
            Volver al inicio de sesión
          </Link>
        </div>
      </Card>
    </div>
  );
}