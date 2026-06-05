"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import styles from "./Login.module.css";

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

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      login();
    }
  };

  return (
    <div className={styles.loginRoot}>
      <div className={styles.topDecoration} />
      <div className={styles.bottomDecoration} />

      <div className={styles.card}>
        <div className={styles.logo}>
          <img
            src="/Logos Incarpalm RGB-01.png"
            alt="IncarPalm"
          />
        </div>

        <h1 className={styles.title}>
          Iniciar <span>Sesión</span>
        </h1>

        <p className={styles.subtitle}>
          USA · Canada · México 2026
        </p>

        <div className={styles.field}>
          <label className={styles.label}>
            Correo electrónico
          </label>

          <input
            type="email"
            className={styles.input}
            placeholder="correo@empresa.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="email"
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>
            Contraseña
          </label>

          <input
            type="password"
            className={styles.input}
            placeholder="Ingrese su contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="current-password"
          />
        </div>

        <button
          onClick={login}
          disabled={loading}
          className={styles.button}
        >
          {loading
            ? "Ingresando..."
            : "Iniciar Sesión"}
        </button>

        <div className={styles.registerLink}>
          <Link href="/register">
            ¿No tienes cuenta?
            <span> Regístrate aquí</span>
          </Link>
        </div>
      </div>
    </div>
  );
}