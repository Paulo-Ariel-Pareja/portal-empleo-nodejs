const express = require('express');
const router = express.Router();
const homeController = require('./../controllers/homeController');
const vacantesController = require('./../controllers/vacantesController');
const usuariosController = require('./../controllers/usuariosController');
const authController = require('./../controllers/authController');

module.exports = () => {
    router.get('/', homeController.mostrarTrabajos);

    router.get('/vacantes/nueva', authController.verificarUsuario, vacantesController.formularioNuevaVacante);
    router.post('/vacantes/nueva', authController.verificarUsuario, vacantesController.validarVacante, vacantesController.agregarVacante);
    router.get('/vacante/editar/:url', authController.verificarUsuario, vacantesController.formEditarVacante);
    router.post('/vacante/editar/:url', authController.verificarUsuario, vacantesController.validarVacante, vacantesController.editarVacante);
    router.get('/vacante/:url', vacantesController.mostrarVacante);
    router.delete('/vacante/eliminar/:id', vacantesController.eliminarVacante);

    router.get('/crear-cuenta', usuariosController.formCrearCuenta);
    router.post('/crear-cuenta', usuariosController.validarRegistro, usuariosController.crearUsuario);

    router.get('/iniciar-sesion', usuariosController.formIniciarSesion);
    router.post('/iniciar-sesion', authController.autenticarUsuario);
    router.get('/cerrar-sesion', authController.verificarUsuario, authController.cerrarSesion);
    router.get('/reestablecer-password', authController.formReestablecerContraseña);
    router.post('/reestablecer-password', authController.enviarToken);
    router.get('/reestablecer-password/:token', authController.reestablecerPassword);
    router.post('/reestablecer-password/:token', authController.guardarNuevoPassword);

    router.get('/administracion', authController.verificarUsuario, authController.mostrarPanel);
    router.get('/editar-perfil', authController.verificarUsuario,
        //usuariosController.validarPerfil, 
        usuariosController.formEditarPerfil);
    router.post('/editar-perfil', authController.verificarUsuario, usuariosController.subirImagen, usuariosController.editarPerfil);

    router.post('/vacante/:url', vacantesController.subirCV, vacantesController.contactar);
    router.get('/candidatos/:id', authController.verificarUsuario, vacantesController.mostrarCandidatos)

    router.post('/buscador', vacantesController.buscarVacantes);

    return router;
}; 