"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async () => {
    if (!email.trim()) {
      toast.error("Ingrese su correo electrónico");
      return;
    }
    if (!password.trim()) {
      toast.error("Ingrese su contraseña");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error("Correo o contraseña incorrectos");
      setLoading(false);
      return;
    }

    toast.success("Bienvenido");
    setTimeout(() => {
      router.push("/dashboard");
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") login();
  };

  return (
    <div className="min-h-screen flex justify-center items-center relative overflow-hidden p-4 sm:p-6 bg-animated-gradient">
      {/* Elementos decorativos de fondo */}
      <div className="absolute top-0 right-0 w-[250px] sm:w-[350px] h-[250px] sm:h-[350px] bg-[var(--primary)] opacity-10 rounded-full translate-x-[30%] -translate-y-[30%] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[200px] sm:w-[300px] h-[200px] sm:h-[300px] bg-[var(--accent)] opacity-10 rounded-full -translate-x-[30%] translate-y-[30%] pointer-events-none" />

      <Card className="max-w-[450px] p-8 sm:p-10 md:p-12 z-10 relative">
        <div className="text-center mb-6">
          {/* Se recomienda a futuro usar <Image /> de Next.js para optimizar la carga */}
          <img
            src="/Logos Incarpalm RGB-01.png"
            alt="IncarPalm"
            className="h-16 mx-auto object-contain"
          />
        </div>

        <h1 className="text-3xl font-bold text-center text-[var(--primary)] mb-2">
          Iniciar <span className="text-[var(--accent)]">Sesión</span>
        </h1>

        <p className="text-center text-[var(--text-secondary)] mb-8 font-medium">
          USA · Canada · México 2026
        </p>

        <div className="space-y-2">
          <Input
            label="Correo electrónico"
            type="email"
            placeholder="correo@empresa.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="email"
          />

          <Input
            label="Contraseña"
            type="password"
            placeholder="Ingrese su contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="current-password"
          />
        </div>
        <div className="w-full text-center mt-1">
          <Link
            href="/forgot-password"
            className="text-xs text-[var(--primary)] hover:text-[var(--primary-hover)] transition-colors"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <Button onClick={login} disabled={loading} className="mt-8">
          {loading ? "Ingresando..." : "Iniciar Sesión"}
        </Button>

        <div className="mt-8 text-center text-sm sm:text-base">
          <Link
            href="/register"
            className="text-[var(--text-secondary)] hover:text-[var(--foreground)] transition-colors"
          >
            ¿No tienes cuenta?{" "}
            <span className="text-[var(--primary)] font-semibold">
              Regístrate aquí
            </span>
          </Link>
        </div>
      </Card>
    </div>
  );
}
