const passport = require('passport');
const mongoose = require('mongoose');
const Vacante = mongoose.model('Vacante');
const Usuario = mongoose.model('Usuario');
const crypto = require('crypto');
const enviarEmail = require('./../handlers/email');

exports.autenticarUsuario = passport.authenticate('local', {
    successRedirect: '/administracion',
    failureRedirect: '/iniciar-sesion',
    failureFlash: true,
    badRequestMessage: 'Ambos campos son obligatorios!'
});

exports.verificarUsuario = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/iniciar-sesion');
};

exports.mostrarPanel = async (req, res) => {
    const vacantes = await Vacante.find({
        autor: req.user._id
    })
    res.render('administracion', {
        nombrePagina: 'Panel de Administracion',
        tagline: 'Crea y administra tus vacantes desde aqui',
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen,
        vacantes
    })
};

exports.cerrarSesion = (req, res) => {
    req.logout();
    req.flash('correcto', 'Cerrastes tu sesion, hasta luego!')
    return res.redirect('/iniciar-sesion')
};

exports.formReestablecerContraseña = (req, res) => {
    res.render('restablecer-password', {
        nombrePagina: 'Restablecer contraseña olvidada',
        tagline: 'Te ayudaremos a volver cambiar la contraseña, indicanos tu email'
    })
};

exports.enviarToken = async (req, res) => {
    const usuario = await Usuario.findOne({ email: req.body.email });
    if (!usuario) {
        req.flash('error', 'Cuenta no encontrada');
        return res.redirect('/iniciar-sesion');
    };

    usuario.token = crypto.randomBytes(20).toString('hex');
    usuario.expira = Date.now() + 3600000;
    await usuario.save();
    const resetUrl = `http://${req.headers.host}/reestablecer-password/${usuario.token}`;

    await enviarEmail.enviar({
        usuario,
        subject: 'Password reset',
        resetUrl,
        archivo: 'reset'
    })

    req.flash('correcto', 'Te enviamos un correo, revisalo por favor');
    res.redirect('/iniciar-sesion');
};

exports.reestablecerPassword = async (req, res) => {
    const usuario = await Usuario.findOne({
        token: req.params.token,
        expira: {
            $gt: Date.now()
        }
    });

    if (!usuario || usuario === null) {
        req.flash('error', 'Por favor, volve a solicitar nuevamente tu cambio de contraseña');
        return res.render('/reestablecer-password');
    }

    res.render('nuevo-password', {
        nombrePagina: 'Nueva contraseña'
    });
};

exports.guardarNuevoPassword = async (req, res) => {
    console.log('METODO: guardarNuevoPassword')
    const usuario = await Usuario.findOne({
        token: req.params.token,
        expira: {
            $gt: Date.now()
        }
    });

    if (!usuario) {
        req.flash('error', 'Por favor, volve a solicitar nuevamente tu cambio de contraseña, tu solicitud expiro');
        return res.redirect('/reestablecer-password');
    };

    usuario.passport = req.body.password;
    usuario.token = undefined;
    usuario.expira = undefined;

    await usuario.save();
    req.flash('correcto', 'Cambiamos tu contraseña');
    res.redirect('/iniciar-sesion');
}