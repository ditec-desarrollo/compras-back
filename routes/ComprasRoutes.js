const { Router } = require("express");
const { obtenerTiposDeCompras } = require("../controllers/ComprasControllers");


const router = Router();



router.get("/tipocompra/listar", obtenerTiposDeCompras)



module.exports = router;