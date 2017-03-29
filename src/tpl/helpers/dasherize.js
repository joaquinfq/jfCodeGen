const decamelize = require('decamelize');
/**
 * Convierte un texto CamelCase a texto separado por un guión.
 *
 * @param {String} text Texto a convertir.
 * @param {Object} opts Opciones de la plantilla
 *
 * @return {String}
 */
module.exports = function (text, opts)
{
    return decamelize(text, (opts && opts.sep) || '-');
};
