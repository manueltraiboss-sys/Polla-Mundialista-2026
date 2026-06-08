"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import PasswordStrength from "@/components/ui/PasswordStrength";

export default function RegisterPage() {
  const router = useRouter();
  
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const register = async () => {
    if (!fullName.trim()) {
      toast.error("Ingrese su nombre completo");
      return;
    }

    if (!email.trim()) {
      toast.error("Ingrese su correo electrónico");
      return;
    }

    if (password.length < 8) {
      toast.error("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    toast.success("Usuario registrado. Revise su correo para activar la cuenta.");

    setTimeout(() => {
      router.push("/login"); // ✅ Cambiado de window.location.href a router.push()
    }, 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      register();
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center relative overflow-hidden p-4 sm:p-6 bg-animated-gradient">
      
      {/* Elementos decorativos de fondo (Consistentes con Login) */}
      <div className="absolute top-0 right-0 w-[250px] sm:w-[350px] h-[250px] sm:h-[350px] bg-[var(--primary)] opacity-10 rounded-full translate-x-[30%] -translate-y-[30%] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[200px] sm:w-[300px] h-[200px] sm:h-[300px] bg-[var(--accent)] opacity-10 rounded-full -translate-x-[30%] translate-y-[30%] pointer-events-none" />

      <Card className="max-w-[480px] p-8 sm:p-10 md:p-12 z-10 relative">
        <div className="text-center mb-6">
          <img 
            src="/Logos Incarpalm RGB-01.png" 
            alt="IncarPalm" 
            className="h-16 mx-auto object-contain"
          />
        </div>

        <h1 className="text-3xl font-bold text-center text-[var(--primary)] mb-2">
          Crear <span className="text-[var(--accent)]">Cuenta</span>
        </h1>

        <p className="text-center text-[var(--text-secondary)] mb-6 font-medium">
          Acceda al sistema corporativo de IncarPalm
        </p>

        {/* Indicador de pasos */}
        <div className="flex gap-2 mb-8">
          {[0, 1, 2].map((i) => {
            const filled =
              (i === 0 && fullName.trim()) ||
              (i === 1 && email.trim()) ||
              (i === 2 && password.length >= 6);

            return (
              <div
                key={i}
                className={`flex-1 h-1.5 rounded-full transition-colors duration-300 ${
                  filled ? "bg-[var(--accent)]" : "bg-[var(--surface-border)]"
                }`}
              />
            );
          })}
        </div>

        <div className="space-y-1">
          <Input
            label="Nombre completo"
            type="text"
            placeholder="Ej. Juan Pérez"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            onKeyDown={handleKeyDown}
          />

          <Input
            label="Correo electrónico"
            type="email"
            placeholder="correo@empresa.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
          />

          <div>
            <Input
              label="Contraseña"
              type="password"
              placeholder="Mínimo 8 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              className="mb-0" // Reducimos margen para que el medidor quede más cerca
            />
            <PasswordStrength password={password} />
          </div>
        </div>

        <Button onClick={register} disabled={loading} className="mt-6">
          {loading ? "Registrando..." : "Crear Cuenta"}
        </Button>

        <div className="mt-8 text-center text-sm sm:text-base">
          <Link href="/login" className="text-[var(--text-secondary)] hover:text-[var(--foreground)] transition-colors">
            ¿Ya tienes cuenta? <span className="text-[var(--primary)] font-semibold">Inicia sesión</span>
          </Link>
        </div>
      </Card>
    </div>
  );
}