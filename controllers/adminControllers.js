const { conectarSMTContratacion } = require("../config/dbEstadisticasMYSQL");
const fs = require("fs");
const path = require("path");

//-----------CONTRATACIONES--------------
const listarTipoContratacion = async (req, res) => {
  const connection = await conectarSMTContratacion();
  try {
    const [contrataciones] = await connection.execute(
      "SELECT * FROM tipo_contratacion WHERE habilita = 1"
    );
    res.status(200).json({ contrataciones });
  } catch (error) {
    res.status(500).json({ message: error.message || "Algo salió mal :(" });
  } finally {
    connection.end();
  }
};

const listarContratacionPorId = async (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM contratacion WHERE id_contratacion = ?";
  const values = [id];
  let connection;
  try {
    connection = await conectarSMTContratacion();
    const [contratacion] = await connection.execute(sql, values);
    if (contratacion.length > 0) {
      res.status(200).json({ contratacion });
    } else {
      res.status(400).json({ message: "No se encontró la contratación" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message || "Algo salió mal :(" });
  } finally {
    connection.end();
  }
};

const listarTipoInstrumento = async (req, res) => {
  const connection = await conectarSMTContratacion();
  try {
    const [instrumentos] = await connection.execute(
      "SELECT * FROM tipo_instrumento WHERE habilita = 1"
    );
    res.status(200).json({ instrumentos });
  } catch (error) {
    res.status(500).json({ message: error.message || "Algo salió mal :(" });
  } finally {
    connection.end();
  }
};

const listarContratacionBack = async (req, res) => {
  const connection = await conectarSMTContratacion();
  try {
    const [contrataciones] = await connection.execute(
      "SELECT * FROM contratacion"
    );

    contrataciones.reverse();
    res.status(200).json({ contrataciones });
  } catch (error) {
    res.status(500).json({ message: error.message || "Algo salió mal :(" });
  } finally {
    connection.end();
  }
};

const listarContratacion = async (req, res) => {
  const connection = await conectarSMTContratacion();
  try {
    const [contrataciones] = await connection.execute(
      "SELECT * FROM contratacion WHERE habilita = 1"
    );

    contrataciones.reverse();
    res.status(200).json({ contrataciones });
  } catch (error) {
    res.status(500).json({ message: error.message || "Algo salió mal :(" });
  } finally {
    connection.end();
  }
};

const agregarContratacion = async (req, res) => {
  let connection;
  connection = await conectarSMTContratacion();
  try {
    const {
      fecha_apertura,
      hora_apertura,
      fecha_presentacion,
      hora_presentacion,
      nombre_contratacion,
      id_tcontratacion,
      num_instrumento,
      id_tinstrumento,
      expte,
      valor_pliego,
      detalle,
      habilita,
    } = req.body;

    const archivo = req.file;

    if (archivo == undefined) {
      logger.error("Error por falta de archivo");
      return res.status(500).json({ message: "Por favor, adjunta un archivo" });
    }

    // Obtener el nombre del archivo cargado
    const nombre_archivo = archivo.filename;
    const detalleValorPorDefecto = "";
    const detalleFinal = detalle ?? detalleValorPorDefecto;
    // Obtener el último id_contratacion de la tabla
    const [lastIdResult] = await connection.query(
      "SELECT MAX(id_contratacion) AS max_id FROM contratacion"
    );
    let nextId = lastIdResult[0].max_id + 1; // Generar el próximo id_contratacion
    // Query para insertar una nueva convocatoria
    const sql =
      "INSERT INTO contratacion (id_contratacion, fecha_apertura, hora_apertura, fecha_presentacion, hora_presentacion, nombre_contratacion, id_tcontratacion, num_instrumento, id_tinstrumento, expte, valor_pliego, habilita, nombre_archivo, detalle) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    const values = [
      nextId,
      fecha_apertura,
      hora_apertura,
      fecha_presentacion,
      hora_presentacion,
      nombre_contratacion,
      id_tcontratacion,
      num_instrumento,
      id_tinstrumento,
      expte,
      valor_pliego,
      habilita,
      nombre_archivo,
      detalleFinal,
    ];

    // Ejecutar la consulta SQL para insertar la nueva convocatoria
    await connection.execute(sql, values);

    // Define las rutas de origen y destino
    const archivoOrigen = path.join(__dirname, "..", "pdf", nombre_archivo);
    const archivoDestino = path.join(
      __dirname,
      "..",
      "..",
      "httpdocs",
      "PDF-Convocatorias",
      nombre_archivo
    );

    // Verifica si la carpeta destino existe, de lo contrario, créala
    const carpetaDestino = path.dirname(archivoDestino);
    if (!fs.existsSync(carpetaDestino)) {
      fs.mkdirSync(carpetaDestino, { recursive: true });
    }

    // Mueve el archivo
    fs.rename(archivoOrigen, archivoDestino, (err) => {
      if (err) {
        console.log("Error al mover el archivo:", err);
      } else {
        console.log("Archivo movido exitosamente");
      }
    });

    res.status(201).json({
      message: "Convocatoria creada con éxito",
      id: nextId,
      num_contratacion: nextId,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Algo salió mal :(" });
  } finally {
    connection?.end();
  }
};

const agregarAnexo = async (req, res) => {
  let connection;
  connection = await conectarSMTContratacion();
  try {
    const archivo = req.file;
    if (!archivo) {
      return res.status(400).json({ message: "Por favor, adjunta un archivo" });
    }

    // Obtener el nombre del archivo cargado
    const nombre_anexo = archivo.filename;

    // Obtener el último id_contratacion de la tabla
    const [lastIdResult] = await connection.query(
      "SELECT MAX(id_contratacion) AS max_id FROM contratacion"
    );
    let maxId = lastIdResult[0].max_id;
    // Query para insertar una nueva convocatoria
    const sql =
      "UPDATE contratacion SET `nombre_anexo`= ? WHERE `id_contratacion`= ?";
    const values = [nombre_anexo, maxId];
    console.log(values);
    // Ejecutar la consulta SQL para insertar la nueva convocatoria
    await connection.execute(sql, values);

    // Define las rutas de origen y destino
    const archivoOrigen = path.join(__dirname, "..", "pdf", nombre_anexo);
    const archivoDestino = path.join(
      __dirname,
      "..",
      "..",
      "httpdocs",
      "PDF-Convocatorias",
      nombre_anexo
    );

    // Verifica si la carpeta destino existe, de lo contrario, créala
    const carpetaDestino = path.dirname(archivoDestino);
    if (!fs.existsSync(carpetaDestino)) {
      fs.mkdirSync(carpetaDestino, { recursive: true });
    }

    // Mueve el archivo
    fs.rename(archivoOrigen, archivoDestino, (err) => {
      if (err) {
        console.error("Error al mover el archivo:", err);
      } else {
        console.log("Archivo movido exitosamente");
      }
    });
    res.status(201).json({ message: "Anexo agregado con éxito" });
  } catch (error) {
    res.status(500).json({ message: error.message || "Algo salió mal :(" });
  } finally {
    connection?.end();
  }
};

const editarAnexo = async (req, res) => {
  let connection;
  connection = await conectarSMTContratacion();
  try {
    const { id, oldName, num_instrumento, expte } = req.query;
    const archivo = req.file;
    let nombre_anexo = null;
    if (archivo) {
      const instrumento = num_instrumento.replace(/\//g, "-");
      const expediente = expte.replace(/\//g, "-");
      let nombreViejo = oldName.replace(/\//g, "-");
      nombre_anexo = `CONTRATACION_${instrumento}_EXPTE_${expediente}_ANEXO.pdf`;

      // Define las rutas de origen y destino
      const archivoOrigen = path.join(__dirname, "..", "pdf", nombre_anexo);
      const archivoDestino = path.join(
        __dirname,
        "..",
        "..",
        "httpdocs",
        "PDF-Convocatorias",
        nombreViejo
      );

      // Verifica si la carpeta destino existe, de lo contrario, créala
      const carpetaDestino = path.dirname(archivoDestino);
      if (!fs.existsSync(carpetaDestino)) {
        fs.mkdirSync(carpetaDestino, { recursive: true });
      }

      // Mueve el archivo
      fs.rename(archivoOrigen, archivoDestino, (err) => {
        if (err) {
          console.error("Error al mover el archivo:", err);
        } else {
          console.log("Archivo movido exitosamente");
        }
      });
    }
    // Query para actualizar la contratacion
    const sql =
      "UPDATE contratacion SET `nombre_anexo`= ? WHERE `id_contratacion`= ?";
    const values = [nombre_anexo, id];
    // Verificar si la contratacion ya existe con otra ID

    await connection.execute(sql, values);

    res.status(201).json({ message: "Anexo editado con éxito" });
  } catch (error) {
    res.status(500).json({ message: error.message || "Algo salió mal :(" });
  } finally {
    connection.end();
  }
};

const borrarContratacion = async (req, res) => {
  const { id } = req.body;
  const sql = "UPDATE contratacion set habilita = 0 WHERE id_contratacion = ?";
  const values = [id];
  let connection;

  try {
    connection = await conectarSMTContratacion();
    const [result] = await connection.execute(sql, values);
    if (result.affectedRows > 0) {
      res.status(200).json({ message: "Contratación deshabilitada con éxito" });
    } else {
      res.status(400).json({ message: "Contratación no encontrada" });
    }
  } catch (error) {
    console.error("Error al eliminar la contratación:", error);
    res.status(500).json({ message: error.message || "Algo salió mal :(" });
  } finally {
    connection.end();
  }
};

const editarContratacion = async (req, res) => {
  let connection;
  connection = await conectarSMTContratacion();
  try {
    const {
      id,
      nombre_contratacion,
      id_tcontratacion,
      fecha_presentacion,
      hora_presentacion,
      num_instrumento,
      valor_pliego,
      expte,
      id_tinstrumento,
      fecha_apertura,
      hora_apertura,
      habilita,
      oldName,
      detalle,
    } = req.body;
    // Verificar si hay un archivo adjunto
    console.log(req.body);
    const archivo = req.file;
    let nombre_archivo = null;
    nombre_archivo = `CONTRATACION_${num_instrumento}_EXPTE_${expte}.pdf`;
    let nombreViejo = oldName.replace(/\//g, "-");
    let archivoViejo = nombre_archivo.replace(/\//g, "-");

    if (archivo) {
      // Define las rutas de origen y destino
      const archivoOrigen = path.join(__dirname, "..", "pdf", archivoViejo);
      const archivoDestino = path.join(
        __dirname,
        "..",
        "..",
        "httpdocs",
        "PDF-Convocatorias",
        nombreViejo
      );

      // Verifica si la carpeta destino existe, de lo contrario, créala
      const carpetaDestino = path.dirname(archivoDestino);
      if (!fs.existsSync(carpetaDestino)) {
        fs.mkdirSync(carpetaDestino, { recursive: true });
      }

      // Mueve el archivo
      fs.rename(archivoOrigen, archivoDestino, (err) => {
        if (err) {
          console.error("Error al mover el archivo:", err);
        } else {
          console.log("Archivo movido exitosamente");
        }
      });
    } else {
      // Define las rutas de origen y destino
      const archivoOrigen = path.join(__dirname, "..", "pdf", archivoViejo);
      const archivoDestino = path.join(
        __dirname,
        "..",
        "..",
        "httpdocs",
        "PDF-Convocatorias",
        nombreViejo
      );

      fs.rename(archivoOrigen, archivoDestino, (err) => {
        if (err) {
          console.error("Error al mover el archivo:", err);
        } else {
          console.log("Archivo movido exitosamente");
        }
      });
    }

    // Query para actualizar la contratacion
    const sql =
      "UPDATE contratacion SET nombre_contratacion = ?, id_tcontratacion = ?, fecha_presentacion = ?, hora_presentacion = ?, num_instrumento = ?, valor_pliego = ?, expte = ?, id_tinstrumento = ?, fecha_apertura = ?, hora_apertura = ?, habilita = ?, nombre_archivo = ?, detalle = ? WHERE id_contratacion = ?";
    const values = [
      nombre_contratacion,
      id_tcontratacion,
      fecha_presentacion,
      hora_presentacion,
      num_instrumento,
      valor_pliego,
      expte,
      id_tinstrumento,
      fecha_apertura,
      hora_apertura,
      habilita,
      archivoViejo,
      detalle,
      id,
    ];

    // Verificar si la contratacion ya existe con otra ID
    const [contratacion] = await connection.execute(
      "SELECT * FROM contratacion WHERE (nombre_contratacion = ? AND id_tcontratacion = ? AND num_instrumento = ? AND valor_pliego = ? AND expte = ? AND habilita = ?) AND id_contratacion != ?",
      [
        nombre_contratacion,
        id_tcontratacion,
        num_instrumento,
        valor_pliego,
        expte,
        habilita,
        id,
      ]
    );

    if (contratacion.length === 0) {
      // No existe otra contratacion con los mismos datos, se puede proceder con la actualización
      const [result] = await connection.execute(sql, values);
      console.log("Filas actualizadas:", result.affectedRows);
      res
        .status(200)
        .json({ message: "Contratacion modificada con éxito", result });
    } else {
      // Ya existe otra contratacion con los mismos datos, devolver un error
      res.status(400).json({
        message: "Ya existe una contratacion con los mismos datos",
        contratacion: contratacion[0],
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message || "Algo salió mal :(" });
  } finally {
    connection?.end();
  }
};

//-----------CONTRATACIONES--------------

module.exports = { listarTipoContratacion, listarContratacionPorId, listarTipoInstrumento, listarContratacionBack, listarContratacion, agregarContratacion, agregarAnexo, editarAnexo, borrarContratacion, editarContratacion }