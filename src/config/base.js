const jfCodeGenBase = require('../base');
/**
 * Longitud de la indentación a usar por defecto.
 *
 * @type {Number}
 */
let defaultIndent   = 8;
/**
 * Clase base para las distintas configuraciones a usar en la aplicación.
 *
 * @namespace jf.codegen.config
 * @class     jf.codegen.config.Base
 * @extends   jf.codegen.Base
 */
module.exports = class jfCodeGenConfigBase extends jfCodeGenBase
{
    /**
     * @override
     */
    constructor(config)
    {
        super();
        /**
         * Descripción del elemento.
         *
         * @property desc
         * @type     {String[]}
         */
        this.desc = [];
        /**
         * Listado de referencias a documentación a leer.
         *
         * @property docs
         * @type     {Object[]}
         */
        this.docs = [];
        /**
         * Longitud mínima que debe tener la descripción para validarla.
         *
         * @property minDescLength
         * @type     {Number}
         */
        this.minDescLength = -1;
        /**
         * Nombre del elemento.
         *
         * @property name
         * @type     {String}
         */
        this.name = '';
        //---------------------------------------------------------------------
        if (config)
        {
            if (typeof config.desc === 'string')
            {
                config.desc = config.desc.trim().split('\n');
            }
            if (Array.isArray(config.desc))
            {
                config.desc = config.desc
                    .map(i => i.trim())
                    .filter((d, i, a) => !!d && a.indexOf(d) === i);
            }
            if ((!config.desc || !config.desc.length) && !config.override)
            {
                config.desc = ['Sin descripción'];
            }
            this.setProperties(config);
        }
    }

    /**
     * Agrega el prefijo indicado a la propiedad especificada.
     *
     * @method addPrefix
     *
     * @param {String} prefix   Prefijo a agregar.
     * @param {String} property Propiedad a modificar.
     */
    addPrefix(prefix, property)
    {
        if (prefix)
        {
            const _value = this.get(property);
            if (Array.isArray(_value))
            {
                _value.forEach(
                    (value, index) => this.addPrefix(prefix, property + '.' + index)
                );
            }
            else if (typeof _value === 'string' && _value.indexOf('.') !== -1 && _value.indexOf(prefix) === -1)
            {
                this.set(property, prefix + '.' + _value);
            }
        }
    }

    /**
     * Realiza un volcado del elemento.
     *
     * @method dump
     */
    dump()
    {
        console.debug(JSON.stringify(this, null, 4));
    }

    /**
     * Valida si la configuración es correcta.
     *
     * @method validate
     *
     * @return {Boolean} Devuelve `true` si la configuración es válida.
     */
    validate()
    {
        let _isValid = true;
        if (!Array.isArray(this.desc))
        {
            this.error('La descripción debe %s debe ser un array en vez de %s.', this.name, typeof this.desc);
            _isValid = false;
        }
        else if (this.desc.join('\n').length < this.minDescLength)
        {
            this.error('La descripción de la propiedad %s es demasiado corta.', item.name);
            _isValid = false;
        }
        return _isValid;
    }

    /**
     * Asigna la longitud de la indentación por defecto.
     *
     * @param {Number} value Valor a asignar.
     */
    static set defaultIndent(value)
    {
        defaultIndent = value;
    }

    /**
     * Analiza una definición de tipo texto.
     * El texto entre paréntesis se usa para definir campos separados
     * entre sí usando `;` por defecto.
     *
     * ```
     * console.log(
     *     jfCodeGen.config.Base.parseDefinition('Esta es la descripción (val1;val2;val3;;val4)')
     * ); // [ 'Esta es la descripción', val1, val2, val3, '', val4 ]
     * ```
     *
     * @param {String} definition Definición a analizar.
     * @param {String} separator  Separador usado entre campos.
     * @return {String[]}
     */
    static parseDefinition(definition, separator = ';')
    {
        const _first = definition.lastIndexOf('(');
        let _result;
        if (_first === -1)
        {
            _result = [definition];
        }
        else
        {
            const _last = definition.lastIndexOf(')');
            if (_last === -1)
            {
                jfCodeGenBase.i().error('Falta el `)` de cierre en la definición: %s', definition);
            }
            else
            {
                let _desc = definition.substring(0, _first).trim();
                if (_desc[_desc.length - 1] !== '.')
                {
                    _desc += '.';
                }
                _result = [
                    _desc,
                    ...definition.substring(_first + 1, _last).split(separator)
                ];
            }
        }
        return _result;
    }

    /**
     * Devuelve el tipo de datos correcto para el lenguaje a usar.
     *
     * @param {String} type Tipo de datos a analizar.
     *
     * @return {String} Tipo de datos convertido.
     */
    static getType(type)
    {
        if (type && type.indexOf('.') === -1)
        {
            type = type.toLowerCase();
            switch (type)
            {
                case 'bit':
                case 'bool':
                case 'boolean':
                    type = 'Boolean';
                    break;
                case 'decimal':
                case 'double':
                case 'float':
                case 'integer':
                case 'number':
                case 'real':
                    type = 'Number';
                    break;
                default:
                    type = type[0].toUpperCase() + type.substr(1);
            }
        }
        return type;
    }

    /**
     * Convierte un objeto a texto formateado e indentado.
     *
     * @param {Object} value  Objeto a formatear.
     * @param {Number} indent Cantidad de espacios en blanco a agregar al inicio
     *                        de cada línea para indentar las claves.
     *
     * @return {String} Texto formateado e indentado.
     */
    static stringify(value, indent)
    {
        return JSON.stringify(value, null, 4)
            .replace(/"/gm, "'")
            .replace(/^/gm, ' '.repeat(indent || defaultIndent))
            .replace(/:/g, ' :')
            .trim();
    }
};
