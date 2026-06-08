"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [validSession, setValidSession] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const initializeRecovery = async () => {
      try {
        // Procesa el hash que llega desde Supabase
        const { data, error } =
          await supabase.auth.getSession();

        if (error) {
          console.error(error);
        }

        if (data.session) {
          setValidSession(true);
        } else {
          toast.error(
            "El enlace de recuperación es inválido o expiró."
          );
        }
      } catch (err) {
        console.error(err);
      } finally {
        setCheckingSession(false);
      }
    };

    initializeRecovery();
  }, []);

  const updatePassword = async () => {
    if (!password.trim()) {
      toast.error("Ingrese una contraseña");
      return;
    }

    if (password.length < 6) {
      toast.error(
        "La contraseña debe tener al menos 6 caracteres"
      );
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success(
      "Contraseña actualizada correctamente"
    );

    await supabase.auth.signOut();

    setTimeout(() => {
      router.push("/login");
    }, 1500);
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-animated-gradient">
        <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!validSession) {
    return (
      <div className="min-h-screen flex justify-center items-center p-4 bg-animated-gradient">
        <Card className="max-w-[450px] p-8 text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">
            Enlace inválido
          </h1>

          <p className="text-[var(--text-secondary)] mb-6">
            El enlace de recuperación ha expirado o no es
            válido.
          </p>

          <Button onClick={() => router.push("/forgot-password")}>
            Solicitar nuevo enlace
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex justify-center items-center relative overflow-hidden p-4 bg-animated-gradient">

      <div className="absolute top-0 right-0 w-[250px] sm:w-[350px] h-[250px] sm:h-[350px] bg-[var(--primary)] opacity-10 rounded-full translate-x-[30%] -translate-y-[30%]" />
      <div className="absolute bottom-0 left-0 w-[200px] sm:w-[300px] h-[200px] sm:h-[300px] bg-[var(--accent)] opacity-10 rounded-full -translate-x-[30%] translate-y-[30%]" />

      <Card className="max-w-[450px] p-8 z-10">
        <h1 className="text-3xl font-bold text-center text-[var(--primary)] mb-2">
          Nueva <span className="text-[var(--accent)]">Contraseña</span>
        </h1>

        <p className="text-center text-[var(--text-secondary)] mb-8">
          Ingrese su nueva contraseña.
        </p>

        <div className="space-y-4">
          <Input
            label="Nueva contraseña"
            type="password"
            placeholder="Ingrese su nueva contraseña"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
          />

          <Input
            label="Confirmar contraseña"
            type="password"
            placeholder="Repita la contraseña"
            value={confirmPassword}
            onChange={(e) =>
              setConfirmPassword(e.target.value)
            }
          />
        </div>

        <Button
          onClick={updatePassword}
          disabled={loading}
          className="mt-6"
        >
          {loading
            ? "Actualizando..."
            : "Guardar contraseña"}
        </Button>
      </Card>
    </div>
  );
}