const translations = require('../../base').translations;
/**
 * Traduce el texto especificado.
 * Si el texto incluye placeholders pueden especificarse a partir del segundo parámetro.
 *
 * @param {String} text Texto a traducir.
 * @param {Object} opts Opciones de la plantilla
 *
 * @return {String}
 */
module.exports = function (text/*, arg1, arg2, ...,*/, opts)
{
    const _args = [];
    if (typeof text === 'string' && text.indexOf('%') !== -1)
    {
        for (let _i = 1, _l = arguments.length - 1; _i < _l; ++_i)
        {
            let _arg = '' + arguments[_i];
            // Evitamos que aparezcan textos como null, undefined, etc.
            if (_arg === 'false' || _arg === 'null' || _arg === 'undefined')
            {
                _arg = '';
            }
            _args.push(_arg);
        }
    }
    return translations.tr(text, _args);
};
