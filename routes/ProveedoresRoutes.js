const { Router } = require("express");
const auth = require("../middlewares/auth");
const verifyRole = require("../middlewares/verifyRole");



const { 
    listarAnexos, 
    agregarAnexo, 
    editarAnexo, 
    borrarAnexo, 
    listarFinalidades, 
    agregarFinalidad, 
    editarFinalidad, 
    borrarFinalidad, 
    listarFunciones, 
    agregarFuncion, 
    editarFuncion, 
    borrarFuncion, 
    listarItems, 
    agregarItem, 
    editarItem, 
    borrarItem, 
    listarPartidas, 
    agregarPartida, 
    editarPartida, 
    borrarPartida, 
    agregarEjercicio, 
    editarEjercicio, 
    borrarEjercicio, 
    listarTiposDeMovimientos, 
    listarOrganismos, 
    agregarExpediente, 
    listarPartidasConCodigo, 
    obtenerDetPresupuestoPorItemYpartida, 
    agregarMovimiento, 
    listarPartidasCONCAT, 
    partidaExistente, 
    buscarExpediente, 
    listarAnteproyecto, 
    actualizarPresupuestoAnteproyecto, 
    listarEjercicio, 
    actualizarCredito, 
    actualizarPresupuestoAprobado, 
    modificarMovimiento, 
    obtenerPartidasPorItemYMovimiento, 
    editarDetalleMovimiento, 
    acumular, 
    buscarExpedienteParaModificarDefinitiva, 
    agregarMovimientoDefinitivaPreventiva, 
    obtenerPresupuestosParaMovimientoPresupuestario, 
    listarItemsFiltrado, 
    obtenerPerfilPorCuil, 
    actualizarCreditoCompleto, 
    actualizarPresupuestoAprobadoCompleto, 
    obtenerTiposDeInstrumentos, 
    obtenerSaldoPorDetPresupuestoID, 
    obtenerProveedores, 
    editarProveedor, 
    agregarProveedor, 
    eliminarProveedor, 
    obtenerRubros, 
    agregarRubro, 
    crearEstructuraItem, 
    listarItemsSinPartidas, 
    obtenerProveedor, 
    agregarMovimientoPorTransferenciaDePartidas, 
    modificarMovimientoParaTransferenciaEntrePartidas, 
    buscarExpedienteParaModificarPorTransferenciaEntrePartidas, 
    eliminarNomenclador,
    agregarNomenclador,
    editarNomenclador,
    obtenerNomencladores,
    listarPartidasConCodigoGasto,
    buscarExpedienteParaModificarNomenclador,
    obtenerEncuadres,
    obtenerEncuadresLegales,
    editarEncuadreLegal,
    agregarEncuadreLegal,
    eliminarEncuadreLegal,
    modificarMovimientoAltaDeCompromiso,
    obtenerTiposDeCompras,
    obtenerDatosItem
  } = require("../controllers/ProveedoresControllers");
  


const router = Router();



router.get("/proveedores/listar", obtenerProveedores);
router.put("/proveedores/editar", editarProveedor);
router.post("/proveedores/agregar", agregarProveedor);
router.delete("/proveedores/eliminar/:idEliminar", eliminarProveedor);
router.get("/rubros/listar", obtenerRubros);
router.post("/rubros/agregar", agregarRubro);




module.exports = router;