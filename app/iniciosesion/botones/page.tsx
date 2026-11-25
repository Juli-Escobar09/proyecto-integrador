
"use client";

import { useRouter } from "next/navigation";
import "./global.css";

export default function Usuarios() {
  const router = useRouter();

  return (
    <main className="pagina-usuarios">
      <h1>SELECCIONAR USUARIO</h1>

      <p className="subtitulo-usuarios">
        Seleccioná el tipo de usuario para continuar
      </p>

      <div className="contenedor-botones">
        <button onClick={() => router.push("/iniciosecion?rol=director")}>
          Directora/o
        </button>

        <button onClick={() => router.push("/iniciosecion?rol=preceptor")}>
          Preceptora/or
        </button>

        <button onClick={() => router.push("/iniciosecion?rol=coordinador")}>
          Coordinadora/or
        </button>

        <button onClick={() => router.push("/iniciosecion?rol=alumno")}>
          Alumnos/as
        </button>
      </div>
    </main>
  );
}
