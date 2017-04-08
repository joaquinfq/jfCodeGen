const jfCodeGenBase = require('../base');
/**
 * Clase base para las distintas configuraciones a usar en la aplicación.
 *
 * @namespace jf.codegen.config
 * @class     jf.codegen.config.Base
 * @extends   jf.codegen.Base
 */
module.exports = class jfCodeGenConfigBase extends jfCodeGenBase {
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
                    .map(i => i.trim().replace("\\'", "'"))
                    .filter((d, i, a) => !!d && a.indexOf(d) === i);
            }
            if (!config.desc || !config.desc.length)
            {
                config.desc = ['No description'];
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
            this.error(
                'La descripción debe %s debe ser un array en vez de %s.',
                this.name,
                typeof this.desc
            );
            _isValid = false;
        }
        else if (this.desc.join('\n').length < this.minDescLength)
        {
            this.error('La descripción de la propiedad %s es demasiado corta.', item.name);
            _isValid = false;
        }
        return _isValid;
    }
};
