const camelize = require('./camelize');
/**
 * Formatea el tipo de dato para que sea compatible con JSDoc.
 *
 * @method formatType
 *
 * @param {String} type Tipo a formatear.
 *
 * @return {String} Tipo formateado.
 */
module.exports = function (type)
{
    if (type && type[0] !== '{')
    {
        let _type     = type
            .split('|')
            .map(
                text =>
                {
                    let _text = text.trim();
                    if (_text.indexOf('.') === -1)
                    {
                        const _global = camelize(_text);
                        if (_global in global)
                        {
                            _text = _global;
                        }
                    }
                    return _text;
                }
            )
            .join('|');
        // Mantenemos los espacios para el padding de los textos
        const _length = type.length - _type.length;
        type          = _length > 1
            ? `{${_type}}` + ' '.repeat(_length)
            : `{${_type}}`;
    }
    return type;
};
