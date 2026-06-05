"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import styles from "./Register.module.css";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [strength, setStrength] = useState(0);

  const calcStrength = (pw: string) => {
    let score = 0;

    if (pw.length >= 6) score++;
    if (pw.length >= 10) score++;
    if (/[A-Z]/.test(pw) || /[^a-zA-Z0-9]/.test(pw)) score++;

    setStrength(pw ? score : 0);
  };

  const strengthLabel = ["", "Débil", "Regular", "Fuerte"][strength];

  const register = async () => {
    if (!fullName.trim()) {
      toast.error("Ingrese su nombre completo");
      return;
    }

    if (!email.trim()) {
      toast.error("Ingrese su correo electrónico");
      return;
    }

    if (password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
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

    toast.success(
      "Usuario registrado. Revise su correo para activar la cuenta."
    );

    setTimeout(() => {
      window.location.href = "/login";
    }, 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      register();
    }
  };

  return (
    <div className={styles.regRoot}>
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
          Crear <span>Cuenta</span>
        </h1>

        <p className={styles.subtitle}>
          Acceda al sistema corporativo de IncarPalm
        </p>

        <div className={styles.steps}>
          {[0, 1, 2].map((i) => {
            const filled =
              (i === 0 && fullName.trim()) ||
              (i === 1 && email.trim()) ||
              (i === 2 && password.length >= 6);

            return (
              <div
                key={i}
                className={`${styles.step} ${
                  filled ? styles.stepFilled : ""
                }`}
              />
            );
          })}
        </div>

        <div className={styles.field}>
          <label className={styles.label}>
            Nombre completo
          </label>

          <input
            type="text"
            className={styles.input}
            placeholder="Ej. Juan Pérez"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

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
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>
            Contraseña
          </label>

          <input
            type="password"
            className={styles.input}
            placeholder="Mínimo 6 caracteres"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              calcStrength(e.target.value);
            }}
            onKeyDown={handleKeyDown}
          />

          {password.length > 0 && (
            <div className={styles.strengthWrapper}>
              <div className={styles.strengthBars}>
                {[1, 2, 3].map((seg) => (
                  <div
                    key={seg}
                    className={`${styles.strengthBar} ${
                      strength >= seg
                        ? styles.strengthBarActive
                        : ""
                    }`}
                  />
                ))}
              </div>

              <small className={styles.strengthLabel}>
                {strengthLabel}
              </small>
            </div>
          )}
        </div>

        <button
          onClick={register}
          disabled={loading}
          className={styles.button}
        >
          {loading
            ? "Registrando..."
            : "Crear Cuenta"}
        </button>

        <div className={styles.loginLink}>
          <Link href="/login">
            ¿Ya tienes cuenta? <span>Inicia sesión</span>
          </Link>
        </div>
      </div>
    </div>
  );
}