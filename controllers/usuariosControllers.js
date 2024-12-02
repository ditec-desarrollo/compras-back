const { conectar_BD_GAF_MySql } = require("../config/dbEstadisticasMYSQL");


const obtenerPerfilPorCuil = async (req, res) => {
    const { cuil } = req.params;
    const connection = await conectar_BD_GAF_MySql();
  
    try {
        // Obtener el perfil_id correspondiente al cuil
        const [usuarios] = await connection.execute(
            'SELECT perfil_id FROM usuarios WHERE cuil = ?',
            [cuil]
        );
  
        if (usuarios.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
  
        const perfilId = usuarios[0].perfil_id;
  
        // Obtener la fila completa del perfil correspondiente al perfil_id
        const [perfiles] = await connection.execute(
            'SELECT * FROM perfiles WHERE perfil_id = ?',
            [perfilId]
        );
  
        if (perfiles.length === 0) {
            return res.status(404).json({ message: 'Perfil no encontrado' });
        }
  
        res.status(200).json(perfiles[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || 'Algo salió mal :(' });
    } finally {
      if(connection){
        await connection.end();
      }
    }
  };

  const getAuthStatus = async (req, res) => {
    let connection;
    try {
      connection = await conectarBDEstadisticasMySql();
      const id = req.id;
  
      const [user] = await connection.execute(
        "SELECT * FROM persona WHERE id_persona = ?",
        [id]
      );
  
      if (user.length == 0) throw new CustomError("Autenticación fallida", 401);
      const { clave, ...usuarioSinContraseña } = user[0];
      // await connection.end();
      res.status(200).json({ usuarioSinContraseña });
    } catch (error) {
      res.status(error.code || 500).json({
        message:
          error.message || "Ups! Hubo un problema, por favor intenta más tarde",
      });
    } finally {
      // Cerrar la conexión a la base de datos
      if (connection) {
        await connection.end();
      }
    }
  };

  module.exports={obtenerPerfilPorCuil,getAuthStatus}