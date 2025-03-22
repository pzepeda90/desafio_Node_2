import express from "express";
import { writeFile, readFile } from "node:fs/promises";
import bodyParser from "body-parser";
import { nanoid } from "nanoid";
import cors from "cors";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repertorioPath = path.join(__dirname, 'repertorio.json');

const app = express();

// Middleware para parsear el cuerpo de las peticiones
app.use(bodyParser.json());

// Habilitamos CORS
app.use(cors());

// Servir archivos estáticos desde el directorio frontend
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Ruta principal para servir la página web
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// Función para obtener las canciones del repertorio
const getCanciones = async () => {
  try {
    const fsResponse = await readFile(repertorioPath, "utf-8");
    const canciones = JSON.parse(fsResponse);
    return canciones;
  } catch (error) {
    console.error("Error al leer el archivo:", error);
    return [];
  }
};

// GET /canciones - Devuelve las canciones registradas en el repertorio
app.get("/canciones", async (req, res) => {
  const canciones = await getCanciones();
  res.json(canciones);
});

// POST /canciones - Recibe datos de una canción y la agrega al repertorio
app.post("/canciones", async (req, res) => {
  const { titulo, artista, tono } = req.body;
  
  if (!titulo || !artista || !tono) {
    return res.status(400).json({ 
      message: "Los campos titulo, artista y tono son obligatorios" 
    });
  }

  const nuevaCancion = {
    id: nanoid(),
    titulo,
    artista,
    tono
  };

  let canciones = await getCanciones();
  canciones.push(nuevaCancion);
  
  await writeFile(repertorioPath, JSON.stringify(canciones));
  res.status(201).json(nuevaCancion);
});

// PUT /canciones/:id - Actualiza los datos de una canción existente
app.put("/canciones/:id", async (req, res) => {
  const id = req.params.id;
  const { titulo, artista, tono } = req.body;

  if (!titulo && !artista && !tono) {
    return res.status(400).json({ 
      message: "Se requiere al menos un campo para actualizar" 
    });
  }

  let canciones = await getCanciones();
  const cancion = canciones.find(c => c.id === id);

  if (!cancion) {
    return res.status(404).json({ message: "Canción no encontrada" });
  }

  canciones = canciones.map(c => {
    if (c.id === id) {
      return { 
        ...c, 
        titulo: titulo || c.titulo,
        artista: artista || c.artista,
        tono: tono || c.tono
      };
    }
    return c;
  });

  await writeFile(repertorioPath, JSON.stringify(canciones));
  res.json(canciones.find(c => c.id === id));
});

// DELETE /canciones/:id - Elimina una canción del repertorio
app.delete("/canciones/:id", async (req, res) => {
  const id = req.params.id;

  let canciones = await getCanciones();
  const cancion = canciones.find(c => c.id === id);

  if (!cancion) {
    return res.status(404).json({ message: "Canción no encontrada" });
  }

  canciones = canciones.filter(c => c.id !== id);

  await writeFile(repertorioPath, JSON.stringify(canciones));
  res.json({ message: "Canción eliminada correctamente" });
});

app.listen(8000, () => {
  console.log("Servidor de repertorio de canciones ejecutándose en el puerto 8000");
});
