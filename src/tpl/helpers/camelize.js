const camelcase = require('camelcase');
/**
 * Convierte a CamelCase el texto especificado.
 *
 * @param {String}  text            Texto a convertir.
 * @param {Object}  opts            Opciones de la plantilla
 * @param {Boolean} opts.capitalize Si es `false` no se convierte a mayúscula la primera letra.
 *
 * @return {String}
 */
module.exports = function (text, opts)
{
    text = camelcase(text);
    if (text && (!opts || opts.capitalize !== false))
    {
        text = text[0].toUpperCase() + text.substr(1);
    }
    return text;
};
