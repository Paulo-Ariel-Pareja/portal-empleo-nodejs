import axios from 'axios';
import Swal from 'sweetalert2';

document.addEventListener('DOMContentLoaded', () => {
    const skills = document.querySelector('.lista-conocimientos');

    let alertas = document.querySelector('.alertas');

    if (alertas) {
        limpiarAlertas();
    }

    if (skills) {
        skills.addEventListener('click', agregarSkills);

        skillsSeleccionados();
    }

    const vacantesListado = document.querySelector('.panel-administracion');
    if (vacantesListado) {
        vacantesListado.addEventListener('click', accionesListado);
    }
});
const skills = new Set();
const agregarSkills = e => {
    if (e.target.tagName === 'LI') {
        if (e.target.classList.contains('activo')) {
            skills.delete(e.target.textContent);
            e.target.classList.remove('activo');
        } else {
            skills.add(e.target.textContent);
            e.target.classList.add('activo');
        }
    }
    const skillsArray = [...skills]
    document.querySelector('#skills').value = skillsArray;
};

const skillsSeleccionados = () => {
    const seleccionadas = Array.from(document.querySelectorAll('.lista-conocimientos .activo'));
    seleccionadas.forEach(seleccionada => {
        skills.add(seleccionada.textContent);
    })
    const skillsArray = [...skills]
    document.querySelector('#skills').value = skillsArray;
}

const limpiarAlertas = () => {
    const alertas = document.querySelector('.alertas');
    const interval = setInterval(() => {
        if (alertas.children.length > 0) {
            alertas.removeChild(alertas.children[0]);
        } else if (alertas.children.length === 0) {
            alertas.parentElement.removeChild(alertas);
            clearInterval(interval);
        }
    }, 1500);

};

const accionesListado = e => {
    e.preventDefault();
    if (e.target.dataset.eliminar) {
        Swal.fire({
            title: 'Confirmar eliminacion',
            text: "Estas por eliminar la vacante!",
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Si, eliminar!',
            cancelButtonText: 'No, conservar'
        }).then((result) => {
            if (result.value) {
                const url = `${location.origin}/vacante/eliminar/${e.target.dataset.eliminar}`;

                axios.delete(url, { params: { url } }).then(function (respuesta) {
                    if (respuesta.status === 200) {
                        Swal.fire(
                            'Eliminado!',
                            respuesta.data,
                            'success'
                        );
                        e.target.parentElement.parentElement.parentElement.removeChild(e.target.parentElement.parentElement);
                    }
                })
                .catch(() => {
                    Swal.fire({
                        type: 'error',
                        title: 'Al parecer hay un error...',
                        text: 'No se pudo eliminar'
                    })
                });
            }
        })
    } else if (e.target.tagName === 'A'){
        window.location.href = e.target.href;
    }
}