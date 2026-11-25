
"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../supabase/supabase";

type Registro = {
  id: number;
  titulo?: string;
  descripcion?: string;
  tipo?: string;
  fecha?: string;
  estado?: string;
  observaciones?: string;
  anio_lectivo?: number;
  nota?: number;
  trimestre?: number;
  materias?: any;
  curso_materias?: any;
};

function ConsultaContenido() {
  const searchParams = useSearchParams();
  const seccion = searchParams.get("seccion") || "";

  const [registros, setRegistros] = useState<Registro[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState("");

  const titulos: Record<string, string> = {
    actas: "Mis actas",
    faltas: "Mis faltas",
    asistencias: "Mis asistencias",
    materias: "Mis materias",
    pendientes: "Aprendizajes pendientes",
    calificaciones: "Mis calificaciones",
  };

  useEffect(() => {
    let cancelado = false;

    async function cargarDatos() {
      setCargando(true);
      setMensaje("");
      setRegistros([]);

      try {
        const { data: usuarioData, error: usuarioError } =
          await supabase.auth.getUser();

        if (usuarioError) throw usuarioError;

        const usuario = usuarioData.user;

        if (!usuario) {
          setMensaje("Tenés que iniciar sesión para consultar tu información académica.");
          return;
        }

        let resultado: any;

        switch (seccion) {
          case "actas":
            resultado = await supabase
              .from("actas")
              .select("id, titulo, descripcion, tipo, fecha")
              .eq("alumno_id", usuario.id)
              .order("fecha", { ascending: false });
            break;

          case "faltas":
            resultado = await supabase
              .from("asistencias")
              .select("id, fecha, estado, observaciones")
              .eq("alumno_id", usuario.id)
              .eq("estado", "falta")
              .order("fecha", { ascending: false });
            break;

          case "asistencias":
            resultado = await supabase
              .from("asistencias")
              .select("id, fecha, estado, observaciones")
              .eq("alumno_id", usuario.id)
              .order("fecha", { ascending: false });
            break;

          case "materias":
            resultado = await supabase
              .from("alumno_materias")
              .select("id, anio_lectivo, materias(nombre, descripcion)")
              .eq("alumno_id", usuario.id);
            break;

          case "calificaciones":
            resultado = await supabase
              .from("calificaciones")
              .select(
                "id, nota, trimestre, fecha, descripcion, curso_materias(materias(nombre))"
              )
              .eq("alumno_id", usuario.id)
              .order("fecha", { ascending: false });
            break;

          case "pendientes":
            setMensaje(
              "Esta sección todavía no está conectada: necesitamos crear o identificar la tabla de aprendizajes pendientes."
            );
            return;

          default:
            setMensaje("No se encontró la sección solicitada.");
            return;
        }

        if (resultado.error) throw resultado.error;

        if (!cancelado) {
          setRegistros((resultado.data || []) as Registro[]);

          if (!resultado.data || resultado.data.length === 0) {
            setMensaje("Todavía no hay información cargada en esta sección.");
          }
        }
      } catch (error) {
        console.error("Error al consultar Supabase:", error);

        if (!cancelado) {
          setMensaje(
            error instanceof Error
              ? error.message
              : "No se pudieron cargar los datos."
          );
        }
      } finally {
        if (!cancelado) setCargando(false);
      }
    }

    cargarDatos();

    return () => {
      cancelado = true;
    };
  }, [seccion]);

  function mostrarFecha(fecha?: string) {
    if (!fecha) return "Sin fecha";

    return new Date(fecha).toLocaleDateString("es-AR");
  }

  function mostrarMateria(registro: Registro) {
    const curso = registro.curso_materias;
    const materia = Array.isArray(curso)
      ? curso[0]?.materias
      : curso?.materias;

    return Array.isArray(materia)
      ? materia[0]?.nombre || "Materia"
      : materia?.nombre || "Materia";
  }

  return (
    <main className="alumnos">
      <header className="alumnos-bienvenida">
        <span>PROA DESPEÑADEROS</span>
        <h1>{titulos[seccion] || "Consulta académica"}</h1>
        <p>Esta es tu información académica personal.</p>
      </header>

      <section className="alumnos-consulta">
        {cargando ? (
          <p>Cargando información...</p>
        ) : (
          <>
            {mensaje && <p role="status">{mensaje}</p>}

            {seccion === "actas" &&
              registros.map((registro) => (
                <article className="alumnos-card" key={registro.id}>
                  <h2>{registro.titulo}</h2>
                  <p>{registro.descripcion}</p>
                  <p>Tipo: {registro.tipo || "Otra"}</p>
                  <p>Fecha: {mostrarFecha(registro.fecha)}</p>
                </article>
              ))}

            {(seccion === "faltas" || seccion === "asistencias") &&
              registros.map((registro) => (
                <article className="alumnos-card" key={registro.id}>
                  <h2>
                    {registro.estado === "falta"
                      ? "Inasistencia"
                      : registro.estado === "presente"
                        ? "Presente"
                        : "Llegada tarde"}
                  </h2>
                  <p>Fecha: {mostrarFecha(registro.fecha)}</p>
                  {registro.observaciones && (
                    <p>Observaciones: {registro.observaciones}</p>
                  )}
                </article>
              ))}

            {seccion === "materias" &&
              registros.map((registro) => {
                const materia = Array.isArray(registro.materias)
                  ? registro.materias[0]
                  : registro.materias;

                return (
                  <article className="alumnos-card" key={registro.id}>
                    <h2>{materia?.nombre || "Materia"}</h2>
                    <p>{materia?.descripcion || "Espacio curricular"}</p>
                    {registro.anio_lectivo && (
                      <p>Año lectivo: {registro.anio_lectivo}</p>
                    )}
                  </article>
                );
              })}

            {seccion === "calificaciones" &&
              registros.map((registro) => (
                <article className="alumnos-card" key={registro.id}>
                  <h2>{mostrarMateria(registro)}</h2>
                  <p>Nota: {registro.nota}</p>
                  <p>Trimestre: {registro.trimestre}</p>
                  <p>Fecha: {mostrarFecha(registro.fecha)}</p>
                  {registro.descripcion && <p>{registro.descripcion}</p>}
                </article>
              ))}
          </>
        )}
      </section>

      <Link href="/alumnos" className="alumnos-boton">
        ← Volver al portal
      </Link>

      <footer className="alumnos-footer">
        ProA Despeñaderos · Portal académico
      </footer>
    </main>
  );
}

export default function ConsultaPage() {
  return (
    <Suspense fallback={<main className="alumnos">Cargando...</main>}>
      <ConsultaContenido />
    </Suspense>
  );
}
