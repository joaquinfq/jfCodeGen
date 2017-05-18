/**
 * Formatea el valor de una propiedad para que aparezca correctamente en el código fuente resultante.
 *
 * @param {Object} property Propiedad a formatear.
 *
 * @return {String} Texto formateado.
 */
module.exports = function (property)
{
    const _value = property.value;
    let _result  = '';
    if (property.rawval)
    {
        _result = _value;
    }
    else if (_value === null)
    {
        _result = 'null';
    }
    else
    {
        switch (typeof _value)
        {
            case 'boolean':
                _result = '' + _value;
                break;
            case 'undefined':
                _result = 'undefined';
                break;
            case 'string':
                _result = "'" + _value.replace(/'/g, "\\'") + "'";
                break;
            default:
                _result = _value;
                break;
        }
    }
    return _result;
};
