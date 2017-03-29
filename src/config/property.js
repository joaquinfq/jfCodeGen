const jfCodeGenConfigBase = require('./base');
/**
 * Representa la configuración de una propiedad de una clase.
 *
 * @namespace jf.codegen.config
 * @class     jf.codegen.config.Property
 * @extends   jf.codegen.config.Base
 */
module.exports = class jfCodeGenConfigProperty extends jfCodeGenConfigBase {
    /**
     * @override
     */
    constructor(config)
    {
        super(config);
        /**
         * Valor por defecto.
         *
         * @property defval
         * @type     {String}
         */
        this.defval = null;
        /**
         * Si es `true` indica que la propiedad sobrescribe una presente
         * en la clase padre.
         *
         * @property override
         * @type     {Boolean}
         */
        this.override = false;
        /**
         * Si es `true` indica si el valor debe escribirse tal cual,
         * en caso contrario el valor será formateado.
         *
         * @property rawval
         * @type     {Boolean}
         */
        this.rawval = false;
        /**
         * Si es `true` indica si que el valor es de solo lectura.
         *
         * @property readonly
         * @type     {Boolean}
         */
        this.readonly = false;
        /**
         * Tipo de datos que maneja el objeto o clase a generar.
         *
         * @property type
         * @type     {String}
         */
        this.type = '';
        /**
         * Valor del elemento.
         *
         * @property value
         * @type     {String|null}
         */
        this.value = "null";
        //---------------------------------------------------------------------
        this.setProperties(config);
    }

    /**
     * @override
     */
    validate()
    {
        let _isValid = true;
        if (!this.override)
        {
            _isValid = super.validate();
            if (_isValid)
            {
                if (!this.type)
                {
                    this.error('Falta especificar el tipo de la propiedad %s', this.name);
                    _isValid = false;
                }
            }
        }
        return _isValid;
    }
};
