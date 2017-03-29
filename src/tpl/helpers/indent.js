/**
 * Indenta el valor para que aparezca formateado el código fuente resultante.
 *
 * @param {Object}  property Campo a indentar.
 * @param {Number?} count Cantidad de espacios a usar para indentar.
 *
 * @return {String} Texto indentado.
 */
module.exports = function (property, count)
{
    const _value = property.value;
    if (typeof count !== 'number')
    {
        count = 16;
    }
    const _indent = ' '.repeat(count + 1);
    let _result   = '';
    if (property.rawval)
    {
        _result = _value;
    }
    else
    {
        // @formatter:off
        _result = JSON.stringify(_value === undefined ? '' : _value, null, 4)
            .replace(/^/gm, _indent)
            .replace(
                /"/g,
                '\''
            )
            .trim();
        if (_result.length > 1)
        {
            const _unquote = ['\'null\'', '\'false\'', '\'true\'', '\'undefined\''].indexOf(_result) !== -1 ||
                          // Permitir llamadas a métodos: Core.i('xxxxx')
                          (_result[0] !== '{' && _result.indexOf('(') !== -1) ||
                          // Expresiones regulares
                          (_result.length > 3 && _result[1] === '/' && _result[_result.length - 2] === '/') ||
                          // Constantes de objetos nativos
                          _result.substr(0, 8) === '\'Number.'
            ;
            if (_result[1] === '/' && _result[_result.length - 2] === '/')
            {
                _result = _result.replace(/\\\\/g, '\\');
            }
            if (_unquote)
            {
                _result = _result.substr(1, _result.length - 2);
            }
        }
        // @formatter:on
    }
    return _result;
};
