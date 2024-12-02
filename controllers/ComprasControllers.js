const { conectar_BD_GAF_MySql } = require("../config/dbEstadisticasMYSQL");
const { sequelize } = require("../config/sequelize");
const { obtenerFechaEnFormatoDate } = require("../utils/helpers");
const DetMovimientoNomenclador = require("../models/Financiera/DetMovimientoNomenclador");
const { obtenerFechaDelServidor } = require("../utils/obtenerInfoDelServidor");

const obtenerTiposDeCompras = async (req,res) => {
    let connection;
    try {
      connection = await conectar_BD_GAF_MySql(); // Conexión a la base de datos
  
      // Consulta para obtener los nomencladores y realizar el JOIN con la tabla partidas
      const sqlEncuadres = `
        SELECT * FROM tipocompra`;
  
      // Ejecutar la consulta
      const [tiposDeCompras] = await connection.execute(sqlEncuadres);
  
      // Enviar los resultados como respuesta
      res.status(200).json({ tiposDeCompras });
    } catch (error) {
      // Manejo de errores detallado
      console.error('Error al obtener los tipos de compra:', error);
      res.status(500).json({ message: error.message || "Algo salió mal :(" });
    } finally {
      // Cerrar la conexión a la base de datos
      if (connection) {
        await connection.end();
      }
    }
  }

  
  module.exports = {obtenerTiposDeCompras}