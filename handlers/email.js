const emailConfig = require('./../config/email');
const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');

let transport = nodemailer.createTransport({
    host: emailConfig.host,
    port: emailConfig.port,
    secure: false,
    auth: {
        user: emailConfig.auth.user,
        pass: emailConfig.auth.pass
    },
    tls: {
        rejectUnauthorized: false
    }
});

const handlebarOptions = {
    viewEngine: {
        extname: '.hbs',
        layoutsDir: 'views/email/',
        defaultLayout: 'template',
        partialsDir: 'views/partials/'
    },
    viewPath: 'views/email/',
    extName: '.hbs'
};

transport.use('compile', hbs(handlebarOptions));

exports.enviar = async (opciones) => {
    const mailOptions = {
        from: 'devJobs <no-reply@devjobs.com.ar>',
        to: opciones.usuario.email,
        subject: opciones.subject,
        template: opciones.archivo,
        context: {
            resetUrl: opciones.resetUrl
        }
    }
    await transport.sendMail(mailOptions, (error, respuesta) => {
        if (error) {
            console.log('mail not sent \n', error);
        }
        else {
            console.log("Message sent: ", respuesta.response);
        }
    });
}