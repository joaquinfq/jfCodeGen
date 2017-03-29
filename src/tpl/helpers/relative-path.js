const path      = require('path');
const dasherize = require('./dasherize');
/**
 * Convierte los '.' del nombre en separadores de ruta.
 *
 * @param {String} name Nombre completo del archivo.
 *
 * @return {string}
 */
function formatFile(name)
{
    return name.split('.').map(s => dasherize(s)).join(path.sep);
}
//----------------------------------------------------------------------
module.exports = function (namespace, filename)
{
    return '.' + path.sep + path.relative(
            formatFile(namespace),
            formatFile(filename)
        );
};
