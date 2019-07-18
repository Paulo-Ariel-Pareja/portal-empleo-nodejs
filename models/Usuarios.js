const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const bcrypt = require('bcrypt');

const usuarioSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true
    },
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    token: String,
    expira: Date,
    imagen: String
});

usuarioSchema.pre('save', async function(next){
    if(!this.isModified('password')){
        return next();
    }
    const hash = await bcrypt.hash(this.password, 12);
    this.password = hash;
    next();
});

usuarioSchema.post('save', function(error, doc, next){
    if(error.name === 'MongoError' && error.code === 11000){
        next('Correo ya registrado por otro usuario');
    } else {
        next(error);
    }
});

usuarioSchema.methods = {
    compararPassword: function(password){
        return bcrypt.compareSync(password, this.password);
    }
}

module.exports = mongoose.model('Usuario', usuarioSchema);