
"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../supabase/supabase";

const destinos: Record<string, string> = {
  alumno: "/alumnos",
  director: "/directivos",
  preceptor: "/preceptores",
  coordinador: "/coordinadores",
};

const nombres: Record<string, string> = {
  alumno: "Alumno/a",
  director: "Directivo/a",
  preceptor: "Preceptor/a",
  coordinador: "Coordinador/a",
};

function FormularioInicio() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  const rolSeleccionado = searchParams.get("rol") || "";

  const aceptar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMensaje("");

    if (!destinos[rolSeleccionado]) {
      setMensaje("Primero seleccioná un tipo de usuario.");
      return;
    }

    try {
      setCargando(true);

      // Verificar correo y contraseña
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        setMensaje("Correo o contraseña incorrectos.");
        return;
      }

      // Consultar el rol real del usuario en Supabase
      const { data: perfil, error: perfilError } = await supabase
        .from("perfiles")
        .select("rol")
        .eq("id", data.user.id)
        .single();

      if (perfilError || !perfil) {
        await supabase.auth.signOut();
        setMensaje("No se pudo verificar tu perfil. Contactá a la escuela.");
        return;
      }

      // Comprobar que el rol coincida con el seleccionado
      if (perfil.rol !== rolSeleccionado) {
        await supabase.auth.signOut();

        setMensaje(
          `Tu cuenta no tiene permisos para ingresar como ${nombres[rolSeleccionado]}.`
        );
        return;
      }

      // Ingresar a la sección correspondiente
      router.replace(destinos[perfil.rol]);

    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      setMensaje("Ocurrió un error al iniciar sesión.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <main className="pagina-usuarios">
      <h1>INICIAR SESIÓN</h1>

      <p className="subtitulo-usuarios">
        {nombres[rolSeleccionado]
          ? `Ingreso para ${nombres[rolSeleccionado]}`
          : "Ingresá con tu cuenta institucional"}
      </p>

      <form onSubmit={aceptar}>
        <label htmlFor="email">Correo electrónico</label>

        <input
          id="email"
          type="email"
          placeholder="Ingresá tu correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="username"
          required
        />

        <label htmlFor="password">Contraseña</label>

        <input
          id="password"
          type="password"
          placeholder="Ingresá tu contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />

        <button type="submit" disabled={cargando}>
          {cargando ? "VERIFICANDO..." : "ACEPTAR"}
        </button>
      </form>

      {mensaje && (
        <p role="alert" className="registro-mensaje">
          {mensaje}
        </p>
      )}

      <button
        type="button"
        onClick={() => router.push("/iniciosecion/botones")}
      >
        Volver a seleccionar usuario
      </button>
    </main>
  );
}

export default function InicioSesion() {
  return (
    <Suspense fallback={<p>Cargando inicio de sesión...</p>}>
      <FormularioInicio />
    </Suspense>
  );
}
