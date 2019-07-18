const mongoose = require('mongoose');
const Vacante = mongoose.model('Vacante');
const multer = require('multer');
const shortid = require('shortid');

exports.formularioNuevaVacante = (req, res) => {
    res.render('nueva-vacante', {
        nombrePagina: 'Nueva vacante',
        tagline: 'Llena el formulario y publica tu vacante',
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen
    })
};

exports.agregarVacante = async (req, res) => {
    const vacante = new Vacante(req.body);
    vacante.autor = req.user._id;
    vacante.skills = req.body.skills.split(',');
    const nuevaVacante = await vacante.save();
    res.redirect(`/vacante/${nuevaVacante.url}`);
};

exports.mostrarVacante = async (req, res, next) => {
    const vacante = await Vacante.findOne({ url: req.params.url }).populate('autor');
    if (!vacante) return next();

    res.render('vacante', {
        nombrePagina: vacante.titulo,
        barra: true,
        vacante
    })
};

exports.formEditarVacante = async (req, res, next) => {
    const vacante = await Vacante.findOne({ url: req.params.url });
    if (!vacante) return next();
    res.render('editar-vacante', {
        vacante,
        nombrePagina: `Editar - ${vacante.titulo}`,
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen
    })
};

exports.editarVacante = async (req, res) => {
    const vacanteActualizada = req.body;
    vacanteActualizada.skills = req.body.skills.split(',');
    const vacante = await Vacante.findOneAndUpdate({ url: req.params.url }, vacanteActualizada, {
        new: true,
        runValidators: true
    });
    res.redirect(`/vacante/${vacante.url}`);

};

exports.validarVacante = (req, res, next) => {
    req.sanitizeBody('titulo').escape();
    req.sanitizeBody('empresa').escape();
    req.sanitizeBody('ubicacion').escape();
    req.sanitizeBody('salario').escape();
    req.sanitizeBody('contrato').escape();
    req.sanitizeBody('skills').escape();

    req.checkBody('titulo', 'Ingresa un titulo a tu vacante').notEmpty();
    req.checkBody('empresa', 'Ingresa una empresa').notEmpty();
    req.checkBody('ubicacion', 'Ingresa una ubicacion').notEmpty();
    req.checkBody('contrato', 'Selecciona el tipo de contrato').notEmpty();
    req.checkBody('skills', 'Agrega por lo menos una habilidad').notEmpty();

    const errores = req.validationErrors();
    if(errores){
        req.flash('error', errores.map(error => error.msg));
        res.render('nueva-vacante', {
            nombrePagina: 'Nueva vacante',
            tagline: 'Llena el formulario y publica tu vacante',
            cerrarSesion: true,
            nombre: req.user.nombre,
            mensajes: req.flash()
        });
    }
    next();
};

exports.eliminarVacante = async (req, res) => {
    const {id} = req.params;
    const vacante = await Vacante.findById(id);
    if (verificarAutor(vacante, req.user)){
        vacante.remove();
        res.status(200).send('vacante eliminada');
    } else {
        res.status(403).send('Error');
    }
};

const verificarAutor = (vacante = {}, usuario = {}) => {
    if(!vacante.autor.equals(usuario._id)){
        return false;
    }
    return true;
};



exports.subirCV = (req, res, next) => {
    upload(req, res, function(error){
        if(error){
            if(error instanceof multer.MulterError){
                if(error.code === 'LIMIT_FILE_SIZE'){
                    req.flash('error', 'El archivo es muy grande, el limite es de 2.5mb');
                } else {
                    req.flash('error', error.message);
                }
            } else{
                req.flash('error', error.message);
            }
            res.redirect('back');
            return;
        } else {
            next();
        }
    });
};

const configuracionMulter = {
    limits: { fileSize : 2500000 },
    storage: filestorage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, __dirname+'../../public/uploads/cv');
        },
        filename: (req, file, cb) => {
            const extension = file.mimetype.split('/')[1];
            cb(null, `${shortid.generate()}.${extension}`);
        }
    }),
    fileFilter(req, file, cb) {
        if(file.mimetype === 'application/pdf'){
            cb(null, true);
        } else {
            cb(new Error('Formato no valido'), false);
        }
    }
};

const upload = multer(configuracionMulter).single('cv');

exports.contactar = async (req, res, next) => {
    const vacante = await Vacante.findOne({url: req.params.url});
    if(!vacante) return next();

    const nuevoCandidato = {
        nombre: req.body.nombre,
        email: req.body.email,
        cv: req.file.filename
    };

    vacante.candidatos.push(nuevoCandidato);
    await vacante.save();

    req.flash('correcto', 'Enviamos tu postulacion, te deseamos mucha suerte!');
    res.redirect('/');
};

exports.mostrarCandidatos = async (req, res, next) => {
    const vacante = await Vacante.findById(req.params.id);

    if(!vacante) return next();

    if(vacante.autor != req.user._id.toString()) return next();

    res.render('candidatos', {
        nombrePagina: `Postulantes para ${vacante.titulo}`,
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen,
        candidatos: vacante.candidatos
    })

};

exports.buscarVacantes = async (req, res, next) => {
    const vacantes = await Vacante.find({
        $text: {
            $search: req.body.q
        }
    });

    res.render('home', {
        nombrePagina: `Resultado de la busqueda : ${req.body.q}`,
        barra: true,
        vacantes
    })
}