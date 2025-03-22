import { useEffect, useState } from "react";
import "./App.css";

const App = () => {
  const [canciones, setCanciones] = useState([]);
  const [cancion, setCancion] = useState({
    titulo: "",
    artista: "",
    tono: ""
  });
  const [modoEdicion, setModoEdicion] = useState(false);
  const [idEdicion, setIdEdicion] = useState(null);
  const [mensaje, setMensaje] = useState({texto: '', tipo: ''});

  const mostrarMensaje = (texto, tipo = 'success') => {
    setMensaje({texto, tipo});
    setTimeout(() => {
      setMensaje({texto: '', tipo: ''});
    }, 3000);
  };

  const getCanciones = async () => {
    try {
      console.log("Solicitando canciones al servidor...");
      const response = await fetch("/canciones");
      console.log("Respuesta del servidor:", response.status);
      const datos = await response.json();
      console.log("Datos recibidos:", datos);
      setCanciones(datos);
    } catch (error) {
      console.error("Error al obtener canciones:", error);
      mostrarMensaje("Error al comunicarse con el servidor", "danger");
    }
  };

  useEffect(() => {
    getCanciones();
  }, []);

  const handleInputChange = (e) => {
    console.log("Campo modificado:", e.target.name, e.target.value);
    setCancion({
      ...cancion,
      [e.target.name]: e.target.value
    });
    console.log("Nuevo estado de canción:", {...cancion, [e.target.name]: e.target.value});
  };

  const agregarCancion = async (e) => {
    e.preventDefault();
    console.log("Formulario enviado");
    
    if (!cancion.titulo || !cancion.artista || !cancion.tono) {
      console.log("Campos incompletos:", cancion);
      mostrarMensaje("Todos los campos son obligatorios", "warning");
      return;
    }

    try {
      if (modoEdicion) {
        // Modo edición: actualizar canción existente
        console.log("Actualizando canción:", idEdicion, cancion);
        const response = await fetch(`/canciones/${idEdicion}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(cancion),
        });
        
        console.log("Respuesta del servidor (actualización):", response.status);
        
        if (response.status === 200) {
          mostrarMensaje("Canción actualizada con éxito");
          getCanciones();
          setModoEdicion(false);
          setIdEdicion(null);
        } else {
          mostrarMensaje("Error al actualizar la canción", "danger");
        }
      } else {
        // Modo agregar: crear nueva canción
        console.log("Agregando canción:", cancion);
        const bodyData = {
          titulo: cancion.titulo,
          artista: cancion.artista,
          tono: cancion.tono
        };
        console.log("Datos a enviar:", bodyData);
        
        const response = await fetch("/canciones", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bodyData),
        });
        
        console.log("Respuesta del servidor (creación):", response.status);
        
        if (response.status === 201) {
          const respData = await response.json();
          console.log("Datos de la canción agregada:", respData);
          mostrarMensaje("Canción agregada con éxito");
          getCanciones();
        } else {
          console.error("Error en la respuesta:", response);
          mostrarMensaje("Error al agregar la canción", "danger");
        }
      }
    } catch (error) {
      console.error("Error en la operación:", error);
      mostrarMensaje("Error al comunicarse con el servidor", "danger");
    }

    // Limpiar el formulario
    setCancion({
      titulo: "",
      artista: "",
      tono: ""
    });
  };

  const eliminarCancion = async (id) => {
    const confirmacion = confirm("¿Estás seguro de eliminar esta canción?");
    if (!confirmacion) return;

    const response = await fetch(`/canciones/${id}`, {
      method: "DELETE",
    });
    
    if (response.status === 200) {
      mostrarMensaje("Canción eliminada con éxito");
      getCanciones();
    } else {
      mostrarMensaje("Error al eliminar la canción", "danger");
    }
  };

  const editarCancion = (cancion) => {
    setModoEdicion(true);
    setIdEdicion(cancion.id);
    setCancion({
      titulo: cancion.titulo,
      artista: cancion.artista,
      tono: cancion.tono
    });
    

    document.querySelector('.col-12.col-md-4').scrollIntoView({ behavior: 'smooth' });
    
    // Destacar el formulario brevemente para llamar la atención
    const formContainer = document.querySelector('.col-12.col-md-4');
    formContainer.style.transition = 'background-color 0.5s';
    formContainer.style.backgroundColor = 'rgba(255, 243, 205, 0.5)'; // Color amarillo suave
    
    setTimeout(() => {
      formContainer.style.backgroundColor = 'transparent';
    }, 1000);
  };

  return (
    <div className="container">
      <h1>Mi Repertorio</h1>
      
      {mensaje.texto && (
        <div className={`alert alert-${mensaje.tipo}`} role="alert">
          {mensaje.texto}
        </div>
      )}
      
      <div className="row">
        <div className="col-12 col-md-4">
          <h3 className={modoEdicion ? "text-warning" : ""}>
            {modoEdicion ? (
              <>
                ✏️ Editar Canción
              </>
            ) : (
              <>
                🎵 Agregar Canción
              </>
            )}
          </h3>
          <form onSubmit={agregarCancion}>
            <div className="mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Título"
                name="titulo"
                value={cancion.titulo}
                onChange={handleInputChange}
              />
            </div>
            <div className="mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Artista"
                name="artista"
                value={cancion.artista}
                onChange={handleInputChange}
              />
            </div>
            <div className="mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Tono"
                name="tono"
                value={cancion.tono}
                onChange={handleInputChange}
              />
            </div>
            <div className="d-flex">
              {modoEdicion ? (
                <>
                  <button 
                    type="submit" 
                    className="btn btn-warning"
                  >
                    Guardar Cambios
                  </button>
                  <button 
                    type="button"
                    className="btn btn-secondary ms-2"
                    onClick={() => {
                      setModoEdicion(false);
                      setIdEdicion(null);
                      setCancion({ titulo: "", artista: "", tono: "" });
                    }}
                  >
                    Cancelar
                  </button>
                </>
              ) : (
                <button 
                  type="submit" 
                  className="btn btn-success"
                >
                  Agregar Canción
                </button>
              )}
            </div>
          </form>
        </div>
        
        <div className="col-12 col-md-8">
          <h3>Listado de Canciones</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Artista</th>
                <th>Tono</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {canciones.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center">No hay canciones registradas</td>
                </tr>
              ) : (
                canciones.map((cancion) => (
                  <tr key={cancion.id}>
                    <td>{cancion.titulo}</td>
                    <td>{cancion.artista}</td>
                    <td>{cancion.tono}</td>
                    <td>
                      <button
                        className="btn btn-warning btn-sm me-2"
                        onClick={() => editarCancion(cancion)}
                      >
                        Editar
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => eliminarCancion(cancion.id)}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default App;
