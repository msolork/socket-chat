const { io } = require('../server');
const {Usuarios} = require('../classes/usuarios');

const usuarios = new Usuarios();
const { crearMensaje } = require('../utilidades/utilidades');


io.on('connection', (client) => {

    client.on('entrarChat', (data, callback) => {

        if(!data.nombre || !data.sala){
            return callback({
                error: true,
                mensaje: 'El nombre / sala es necesario'
            });
        }

        client.join(data.sala);

        let personas = usuarios.agregarPersona( client.id, data.nombre, data.sala);
        client.broadcast.to(data.sala).emit('listaPersonas', usuarios.getPersonasPorSala(data.sala));
        client.broadcast.to(data.sala).emit('crearMensaje', crearMensaje('Administrador', `${data.nombre} se unio al chat`));

        // console.log(personas);
        callback(personas);
    });


    client.on('crearMensaje', (data, callback) => {

        let persona = usuarios.getPersona(client.id);

        let mensaje = crearMensaje(persona.nombre, data.mensaje);

        client.broadcast.to(persona.sala).emit('crearMensaje', mensaje);

        callback(mensaje);
    });


    client.on('disconnect', () => {

        let personaBorrada = usuarios.borrarPersona(client.id);

        if(personaBorrada){
            client.broadcast.to(personaBorrada.sala).emit('crearMensaje', crearMensaje('Administrador', `${personaBorrada.nombre} abandono el chat`));

        }

        client.broadcast.to(personaBorrada.sala).emit('listaPersonas', usuarios.getPersonasPorSala(personaBorrada.sala));
    });



    client.on('mensajePrivado', data => {
        let persona = usuarios.getPersona(client.id);

        if(!data.mensaje){
            return;
        }
        console.log(data);
        client.broadcast.to(data.para).emit('mensajePrivado', crearMensaje(persona.nombre, data.mensaje));
    });

});
