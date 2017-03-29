const camelize = require('./tpl/helpers/camelize');
const jfLogger = require('jf-logger');
/**
 * Clase base para el resto de clases del generador de código..
 *
 * @namespace jf.codegen
 * @class     jf.codegen.Base
 * @extends   jf.Logger
 */
module.exports = class jfCodeGenBase extends jfLogger {
    /**
     * Convierte a `camelCase` el texto.
     *
     * @param {String}  text       Texto a convertir.
     * @param {Boolean} capitalize Si es `true` se capitaliza la primera letra.
     *
     * @return {String} Texto convertido.
     */
    camelize(text, capitalize = true)
    {
        return camelize(
            text,
            {
                capitalize : capitalize === true
            }
        );
    }

    /**
     * Muestra un error por pantalla o lanza una excepción si la variable
     * `STOP_ON_ERRORS` es `true`.
     *
     * @param {String} message Mensage a mostrar.
     *
     * @throws Error
     */
    error(message)
    {
        message = this.tr(...arguments);
        this.log('error', '', 'ERROR: %s', message);
        if (process.env.STOP_ON_ERRORS)
        {
            throw new Error(message);
        }
    }

    /**
     * Proxy al sistema de traducciones.
     */
    tr()
    {
        return this.constructor.translations.tr(...arguments);
    }
};
