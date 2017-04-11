const camelize  = require('./camelize');
const dasherize = require('./dasherize');
const path      = require('path');
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
    if (namespace && filename)
    {
        if (namespace.split('.')[0] === filename.split('.')[0])
        {
            // Si son espacios de nombres iguales, las rutas serán relativas.
            filename = '.' + path.sep + path.relative(formatFile(namespace), formatFile(filename));
        }
        else
        {
            // En caso contrario, se asume como un módulo aparte por lo tanto no pueden empezar con '.'.
            filename = dasherize(camelize(filename));
        }
    }
    return filename;
};
