

"use client";

import { useState } from "react";
import { supabase } from "../supabase/supabase";
import "./global.css";

export default function CrearSesion() {
  const [nombre, setNombre] = useState("");
  const [gmail, setGmail] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  const registrarse = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setMensaje("");

    if (!nombre.trim() || !gmail.trim() || !contrasena) {
      setMensaje("Completá todos los campos.");
      return;
    }

    const email = gmail.trim().toLowerCase();

    if (!email.endsWith("@escuelasproa.edu.ar")) {
      setMensaje(
        "Ingresá tu correo institucional @escuelasproa.edu.ar."
      );
      return;
    }

    if (contrasena.length < 8) {
      setMensaje("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    try {
      setCargando(true);

      const { data, error } = await supabase.auth.signUp({
        email,
        password: contrasena,
        options: {
          data: {
            nombre_completo: nombre.trim(),
          },
        },
      });

      if (error) {
        throw error;
      }

      if (data.user && !data.session) {
        setMensaje(
          "¡Cuenta creada! Revisá tu correo institucional para confirmar el registro."
        );
      } else {
        setMensaje(
          "¡Registro exitoso! Tu cuenta y perfil fueron creados."
        );
      }

      setNombre("");
      setGmail("");
      setContrasena("");
    } catch (error) {
      console.error("Error al registrarse:", error);

      setMensaje(
        error instanceof Error
          ? error.message
          : "No se pudo crear la cuenta. Intentá nuevamente."
      );
    } finally {
      setCargando(false);
    }
  };

  return (
    <main className="registro-fondo">
      <section className="registro-tarjeta">
        <h1>CREAR CUENTA</h1>

        <p className="registro-descripcion">
          Escuela Experimental ProA Despeñaderos
        </p>

        <form onSubmit={registrarse}>
          <label htmlFor="nombre">Nombre completo</label>

          <input
            id="nombre"
            type="text"
            placeholder="Ingresá tu nombre completo"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            autoComplete="name"
            required
          />

          <label htmlFor="gmail">Correo institucional</label>

          <input
            id="gmail"
            type="email"
            placeholder="nombre@escuelasproa.edu.ar"
            value={gmail}
            onChange={(e) => setGmail(e.target.value)}
            autoComplete="email"
            required
          />

          <label htmlFor="contrasena">Contraseña</label>

          <input
            id="contrasena"
            type="password"
            placeholder="Mínimo 8 caracteres"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            autoComplete="new-password"
            minLength={8}
            required
          />

          <button type="submit" disabled={cargando}>
            {cargando ? "CREANDO CUENTA..." : "REGISTRARME"}
          </button>
        </form>

        {mensaje && (
          <p className="registro-mensaje" role="status">
            {mensaje}
          </p>
        )}

        <p className="registro-pie">
          ProA Despeñaderos · Sistema escolar
        </p>
      </section>
    </main>
  );
}
