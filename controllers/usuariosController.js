const mongoose = require('mongoose');
const Usuario = mongoose.model('Usuario');
const multer = require('multer');
const shortid = require('shortid');

exports.subirImagen = (req, res, next) => {
    upload(req, res, function(error){
        if(error){
            if(error instanceof multer.MulterError){
                if(error.code === 'LIMIT_FILE_SIZE'){
                    req.flash('error', 'El archivo es muy grande, el limite es de 100kb');
                } else {
                    req.flash('error', error.message);
                }
            } else{
                req.flash('error', error.message);
            }
            res.redirect('/administracion');
            return;
        } else {
            next();
        }
    });
}

const configuracionMulter = {
    limits: { fileSize : 100000 },
    storage: filestorage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, __dirname+'../../public/uploads/perfiles');
        },
        filename: (req, file, cb) => {
            const extension = file.mimetype.split('/')[1];
            cb(null, `${shortid.generate()}.${extension}`);
        }
    }),
    fileFilter(req, file, cb) {
        if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
            cb(null, true);
        } else {
            cb(new Error('Formato no valido'), false);
        }
    }
}

const upload = multer(configuracionMulter).single('imagen');

exports.editarPerfil = async (req, res) => {
    
    const usuario = await Usuario.findById(req.user._id);
    usuario.nombre = req.body.nombre;
    usuario.email = req.body.email;
    if(req.body.password){
        usuario.password = req.body.password;
    }
    if(req.file) { 
        usuario.imagen = req.file.filename;
    }
    await usuario.save();
    req.flash('correcto', 'Tus datos fueron actualizados');
    res.redirect('/administracion');
};


exports.formCrearCuenta = (req, res) => {
    res.render('crear-cuenta', {
        nombrePagina: 'Crear tu cuenta en devJobs',
        tagline: 'Publica y busca empleos para la comunidad Gratis!'
    })
};

exports.validarRegistro = (req, res, next) => {
    req.sanitizeBody('nombre').escape();
    req.sanitizeBody('email').escape();
    req.sanitizeBody('password').escape();
    req.sanitizeBody('confirmar').escape();

    req.checkBody('nombre', 'El nombre es oblicatorio').notEmpty();
    req.checkBody('email', 'El email tiene que ser valido').isEmail();
    req.checkBody('password', 'El password no puede estar vacio').notEmpty();
    req.checkBody('confirmar', 'La confirmacion del password no puede estar vacio').notEmpty();
    req.checkBody('confirmar', 'El passowrd es diferente').equals(req.body.password);

    const errores = req.validationErrors();
    if (errores) {
        req.flash('error', errores.map(error => error.msg));
        res.render('crear-cuenta', {
            nombrePagina: 'Crear tu cuenta en devJobs',
            tagline: 'Publica y busca empleos para la comunidad Gratis!',
            mensajes: req.flash()
        });
        return;
    }
    next();
};

exports.crearUsuario = async (req, res, next) => {
    const usuario = new Usuario(req.body);

    try{
        await usuario.save();
        res.redirect('/iniciar-sesion');
    }catch(error){
        req.flash('error', error);
        res.redirect('/crear-cuenta');
    }
};

exports.formIniciarSesion = (req, res) => {
    res.render('iniciar-sesion', {
        nombrePagina: 'Iniciar sesion en devJobs'
    });
};

exports.formEditarPerfil = (req, res) => {
    res.render('editar-perfil', {
        nombrePagina: 'Edita tu informacion',
        usuario: req.user,
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen
    }); 
};

exports.validarPerfil = (req, res, next) => {
    req.sanitizeBody('nombre').escape();
    req.sanitizeBody('email').escape();
    if(req.body.password){
        req.sanitizeBody('password').escape();
    }

    req.checkBody('nombre', 'El nombre es oblicatorio').notEmpty();
    req.checkBody('email', 'El email tiene que ser valido').isEmail();

    const errores = req.validationErrors();
    if(errores){
        req.flash('error', errores.map(error => error.msg));
        res.render('editar-perfil', {
            nombrePagina: 'Edita tu informacion',
            usuario: req.user,
            cerrarSesion: true,
            nombre: req.user.nombre,
            mensajes: req.flash(),
            imagen: req.user.imagen
        });
        return;
    }
    next();
}