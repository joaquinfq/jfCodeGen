const jfCodeGenConfigBase = require('./base');
/**
 * Representa la configuración de una propiedad de una clase.
 *
 * @namespace jf.codegen.config
 * @class     jf.codegen.config.Property
 * @extends   jf.codegen.config.Base
 */
module.exports = class jfCodeGenConfigProperty extends jfCodeGenConfigBase
{
    /**
     * @override
     */
    constructor(config)
    {
        if (typeof config === 'string')
        {
            config = jfCodeGenConfigBase.parseDefinition(
                config,
                [
                    'desc',
                    'type',
                    'value',
                    ['readonly', 'boolean'],
                    ['static', 'boolean']
                ]
            );
        }
        super(config);
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
         * Indica si la propiedad es estática.
         *
         * @property static
         * @type     {Boolean}
         */
        this.static = false;
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
        this.value = null;
        //---------------------------------------------------------------------
        this.setProperties(config);
        this.__checkProperties();
    }

    /**
     * Verifica los valores de algunas propiedades de la clase
     * para actualizar otros en función de dichos valores.
     *
     * @private
     */
    __checkProperties()
    {
        if (!this.rawval)
        {
            const _value  = this.value;
            const _typeof = typeof _value;
            // Tratamos de acomodar algunos valores que a veces se pierden
            // al leer del archivo de entrada.
            if (!this.type && _typeof === 'string')
            {
                switch (_value)
                {
                    case '[]':
                        this.type  = 'Array';
                        this.value = [];
                        break;
                    case '{}':
                        this.type  = 'Object';
                        this.value = {};
                        break;
                    case 'null':
                    case 'undefined':
                        this.type  = 'Object';
                        this.value = null;
                        break;
                    case 'off':
                    case 'false':
                        this.type  = 'Boolean';
                        this.value = false;
                        break;
                    case 'on':
                    case 'true':
                        this.type  = 'Boolean';
                        this.value = true;
                        break;
                }
            }
            let _type = this.type = this.constructor.getType(this.type || _typeof);
            if (_type.indexOf('[]') !== -1 || Array.isArray(_value))
            {
                _type = 'Array';
            }
            switch (_type)
            {
                case 'Array':
                case 'Object':
                    if (_value === null)
                    {
                        this.value = null;
                    }
                    else
                    {
                        this.rawval = true;
                        this.value  = _value === undefined
                            ? null
                            : this.constructor.stringify(_value);
                    }
                    break;
                case 'String':
                    if (_value === null)
                    {
                        this.value = '';
                    }
                    break;
                case 'Undefined':
                    this.type  = 'String';
                    this.value = '';
                    break;
                default:
                    if (!_value && _type.indexOf('.') !== -1)
                    {
                        this.value = null;
                    }
                    break;
            }
            if (this.value === null)
            {
                _type = this.type;
                if (_type.indexOf('null') === -1)
                {
                    this.type += '|null';
                }
            }
        }
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
