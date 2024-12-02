const { Router } = require("express");

const auth = require("../middlewares/auth");
const validateFields = require("../middlewares/validateFields");
const { check } = require("express-validator");
const { getAuthStatus, obtenerPerfilPorCuil } = require("../controllers/usuariosControllers");



  


const router = Router();

router.get("/authStatus", auth, getAuthStatus);

router.post('/perfil/:cuil', obtenerPerfilPorCuil);



module.exports = router;