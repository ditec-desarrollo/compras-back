const { conectar_BD_GAF_MySql } = require("../config/dbEstadisticasMYSQL");
const { sequelize } = require("../config/sequelize");
const DetMovimiento = require("../models/Financiera/DetMovimiento");
const Movimiento = require("../models/Financiera/Movimiento");
const Expediente = require("../models/Financiera/Expediente");
const { obtenerFechaEnFormatoDate } = require("../utils/helpers");
const DetMovimientoNomenclador = require("../models/Financiera/DetMovimientoNomenclador");
const { obtenerFechaDelServidor } = require("../utils/obtenerInfoDelServidor");







/////////////////////// PROVEDORES ////////////////////////////////

const obtenerProveedores = async (req, res) => {
  let connection;
  try {
    connection = await conectar_BD_GAF_MySql(); // Asegúrate de que esta función esté definida y se conecte correctamente a tu base de datos.

    // Consulta para obtener todos los proveedores
    const sqlProveedores = `
      SELECT * FROM proveedores
    `;
    const [proveedores] = await connection.execute(sqlProveedores);

    // Consulta para obtener todos los rubros asociados a cada proveedor
    const sqlProveedoresRubros = `
      SELECT r.proveedor_id, r.rubroprv_id, rb.rubroprv_det
      FROM r_proveedores_rubroprv r
      LEFT JOIN rubroprv rb ON r.rubroprv_id = rb.rubroprv_id
    `;
    const [proveedoresRubros] = await connection.execute(sqlProveedoresRubros);

    // Enviar los resultados como respuesta
    res.status(200).json({ proveedores, proveedoresRubros });
  } catch (error) {
    // Manejo de errores detallado
    console.error('Error al obtener los datos:', error);
    res.status(500).json({ message: error.message || "Algo salió mal :(" });
  } finally {
    // Cerrar la conexión a la base de datos
    if (connection) {
      await connection.end();
    }
  }
};


const editarProveedor = async (req, res) => {
  let connection;
  try {
    connection = await conectar_BD_GAF_MySql();

    // Datos recibidos desde el request
    const {
      proveedor_id,
      proveedor_razsocial,
      proveedor_cuit,
      proveedor_domicilio,
      proveedor_email,
      proveedor_iva,
      proveedor_nroreso,
      proveedor_anioreso,
      proveedor_telefono,
      proveedor_contacto,
      idRubro,
    } = req.body.proveedorEditado;

    const obj = req.body.selectedRubro;
    const ids = Object.values(obj); // Array de rubroprv_id

    // Iniciar una transacción
    await connection.beginTransaction();

    // Actualizar el proveedor
    const sqlUpdateProveedor = `
      UPDATE proveedores
      SET proveedor_razsocial = ?, proveedor_cuit = ?, proveedor_domicilio = ?, proveedor_email = ?, proveedor_iva = ?, proveedor_nroreso = ?, proveedor_anioreso = ?,proveedor_telefono=?,proveedor_contacto=?
      WHERE proveedor_id = ?
    `;

    const [result] = await connection.execute(sqlUpdateProveedor, [
      proveedor_razsocial.toUpperCase(),
      proveedor_cuit,
      proveedor_domicilio.toUpperCase(),
      proveedor_email,
      proveedor_iva,
      proveedor_nroreso,
      proveedor_anioreso,
      proveedor_telefono,
      proveedor_contacto,
      proveedor_id,
    ]);

    if (result.affectedRows === 0) {
      await connection.rollback(); // Deshacer la transacción en caso de error
      return res.status(404).json({ message: "Proveedor no encontrado", ok: false });
    }

    // Obtener los rubros actuales del proveedor
    const [existingRubros] = await connection.execute(
      `SELECT rubroprv_id FROM r_proveedores_rubroprv WHERE proveedor_id = ?`,
      [proveedor_id]
    );

    const existingRubrosArray = existingRubros.map(row => row.rubroprv_id);

    // Actualizar, eliminar o insertar filas en r_proveedores_rubroprv según sea necesario
    for (let i = 0; i < existingRubrosArray.length; i++) {
      if (i < ids.length) {
        // Actualizar la fila si el rubroprv_id ha cambiado
        if (existingRubrosArray[i] !== ids[i]) {
          await connection.execute(
            `UPDATE r_proveedores_rubroprv SET rubroprv_id = ? WHERE proveedor_id = ? AND rubroprv_id = ?`,
            [ids[i], proveedor_id, existingRubrosArray[i]]
          );
        }
      } else {
        // Eliminar fila extra si hay más filas en la base de datos que rubros enviados
        await connection.execute(
          `DELETE FROM r_proveedores_rubroprv WHERE proveedor_id = ? AND rubroprv_id = ?`,
          [proveedor_id, existingRubrosArray[i]]
        );
      }
    }

    // Insertar nuevas filas si hay más rubros enviados que filas existentes
    for (let i = existingRubrosArray.length; i < ids.length; i++) {
      await connection.execute(
        `INSERT INTO r_proveedores_rubroprv (proveedor_id, rubroprv_id) VALUES (?, ?)`,
        [proveedor_id, ids[i]]
      );
    }

    // Confirmar la transacción si todo fue exitoso
    await connection.commit();

    res.status(200).json({ message: "Proveedor y rubros actualizados correctamente", ok: true });
  } catch (error) {
    console.error('Error al actualizar el proveedor y los rubros:', error);
    if (connection) await connection.rollback(); // Deshacer la transacción en caso de error
    res.status(500).json({ message: error.message || "Algo salió mal :(" });
  } finally {
    // Cerrar la conexión a la base de datos
    if (connection) {
      await connection.end();
    }
  }
};



const agregarProveedor = async (req, res) => {
  let connection;
  console.log(req.body);
  try {
    connection = await conectar_BD_GAF_MySql();

    // Datos recibidos desde el request
    const { razonSocial, cuit, domicilio, email, iva, nroreso, anioreso,telefono,contacto } = req.body.nuevoProveedor;
    const obj = req.body.selectedRubro;
    const ids = Object.values(obj);

    // Iniciar una transacción
    await connection.beginTransaction();

    // Consulta para insertar un nuevo proveedor
    const sqlInsertProveedor = `
      INSERT INTO proveedores (proveedor_razsocial, proveedor_cuit, proveedor_domicilio, proveedor_email, proveedor_iva, proveedor_nroreso, proveedor_anioreso,proveedor_telefono,proveedor_contacto, proveedor_registro)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const {fecha_actual} =  await obtenerFechaDelServidor()

    // Ejecución de la consulta con los valores a insertar
    const [result] = await connection.execute(sqlInsertProveedor, [
      razonSocial.toUpperCase(),
      cuit,
      domicilio.toUpperCase(),
      email,
      iva,
      nroreso,
      anioreso,
      telefono,
      contacto,
      fecha_actual
    ]);

    // Verificar si alguna fila fue afectada (es decir, si el proveedor fue insertado)
    if (result.affectedRows === 0) {
      await connection.rollback(); // Deshacer la transacción en caso de error
      return res.status(400).json({ message: "No se pudo agregar el proveedor", ok: false });
    }

    // Obtener el ID del proveedor insertado
    const proveedorId = result.insertId;

    // Consulta para insertar en la tabla r_proveedores_rubroprv
    const sqlInsertRubroProveedor = `
      INSERT INTO r_proveedores_rubroprv (proveedor_id, rubroprv_id)
      VALUES (?, ?)
    `;

    // Ejecutar la consulta para cada rubroprv_id
    for (const idRubro of ids) {
      const [resultRubro] = await connection.execute(sqlInsertRubroProveedor, [proveedorId, idRubro]);

      // Verificar si la inserción en r_proveedores_rubroprv fue exitosa
      if (resultRubro.affectedRows === 0) {
        await connection.rollback(); // Deshacer la transacción en caso de error
        return res.status(400).json({ message: "No se pudo agregar el rubro al proveedor", ok: false });
      }
    }

    // Confirmar la transacción si todo fue exitoso
    await connection.commit();

    res.status(201).json({ message: "Proveedor y rubros agregados correctamente", ok: true, id: proveedorId });
  } catch (error) {
    console.error('Error al agregar el proveedor y los rubros:', error);
    if (connection) await connection.rollback(); // Deshacer la transacción en caso de error
    res.status(500).json({ message: error.message || "Algo salió mal :(" });
  } finally {
    // Cerrar la conexión a la base de datos
    if (connection) {
      await connection.end();
    }
  }
};



const eliminarProveedor = async (req, res) => {
  let connection;
  try {
    connection = await conectar_BD_GAF_MySql(); // Conectar a la base de datos

    // Obtener el ID del proveedor a eliminar desde el request
    const proveedor_id = req.params.idEliminar;

    // Iniciar una transacción
    await connection.beginTransaction();

    // Consulta para eliminar las filas en r_proveedores_rubroprv que contengan el proveedor_id
    const sqlDeleteRubroProveedor = `
      DELETE FROM r_proveedores_rubroprv
      WHERE proveedor_id = ?
    `;
    await connection.execute(sqlDeleteRubroProveedor, [proveedor_id]);

    // Consulta para eliminar el proveedor
    const sqlDeleteProveedor = `
      DELETE FROM proveedores
      WHERE proveedor_id = ?
    `;

    // Ejecución de la consulta con el ID del proveedor
    const [result] = await connection.execute(sqlDeleteProveedor, [proveedor_id]);

    // Verificar si alguna fila fue afectada (es decir, si el proveedor fue eliminado)
    if (result.affectedRows === 0) {
      await connection.rollback(); // Deshacer la transacción en caso de error
      return res.status(404).json({ message: "Proveedor no encontrado", ok: false });
    }

    // Confirmar la transacción si todo fue exitoso
    await connection.commit();

    res.status(200).json({ message: "Proveedor y rubros asociados eliminados correctamente", ok: true });
  } catch (error) {
    console.error('Error al eliminar el proveedor:', error);
    if (connection) await connection.rollback(); // Deshacer la transacción en caso de error
    res.status(500).json({ message: error.message || "Algo salió mal :(" });
  } finally {
    // Cerrar la conexión a la base de datos
    if (connection) {
      await connection.end();
    }
  }
};


const obtenerRubros = async (req, res) => {
  let connection;
  try {
    connection = await conectar_BD_GAF_MySql(); // Asegúrate de que esta función esté definida y se conecte correctamente a tu base de datos.

    // Consulta para obtener todos los proveedores
    const sqlQuery = `SELECT * FROM rubroprv`;
    const [rubros] = await connection.execute(sqlQuery);

    // Enviar los resultados como respuesta
    res.status(200).json({ rubros });
  } catch (error) {
    // Manejo de errores
    res.status(500).json({ message: error.message || "Algo salió mal :(" });
  } finally {
    // Cerrar la conexión a la base de datos
    if (connection) {
      await connection.end();
    }
  }
};

const agregarRubro = async (req, res) => {
  let connection;
 
  try {
    connection = await conectar_BD_GAF_MySql();

    // Datos recibidos desde el request
    const { rubro, codigo } = req.body;

    // Verificar si ya existe un rubro con el mismo código
    const sqlCheckCodigo = `SELECT COUNT(*) as count FROM rubroprv WHERE rubroprv_afip = ?`;
    const [rows] = await connection.execute(sqlCheckCodigo, [codigo]);

    // Si el código ya existe, retornamos un error
    if (rows[0].count > 0) {
      return res.status(200).json({ message: "El código ya existe, no se puede agregar el rubro", ok: false });
    }

    // Si el código no existe, procedemos con la inserción
    const sqlInsertRubro = `
      INSERT INTO rubroprv (rubroprv_det, rubroprv_afip) VALUES (?, ?)
    `;

    // Ejecución de la consulta con los valores a insertar
    const [result] = await connection.execute(sqlInsertRubro, [rubro.toUpperCase(), codigo]);

    if (result.affectedRows === 0) {
      return res.status(400).json({ message: "No se pudo agregar el rubro", ok: false });
    }

    res.status(201).json({ message: "Rubro agregado correctamente", ok: true });
  } catch (error) {
    console.error('Error al agregar el rubro', error);
    res.status(500).json({ message: error.message || "Algo salió mal :(" });
  } finally {
    // Cerrar la conexión a la base de datos
    if (connection) {
      await connection.end();
    }
  }
};


module.exports = {


  obtenerProveedores,
  editarProveedor,
  agregarProveedor,
  eliminarProveedor,
  obtenerRubros,
  agregarRubro,

};






