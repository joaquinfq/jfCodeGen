const jfCodeGenSectionBase = require('./base');
const jfCodeGenProperty    = require('../config/property');
/**
 * Maneja los campos encontrados en la configuración del modelo.
 *
 * @namespace jf.codegen.section.Properties
 * @class     jf.codegen.section.Properties
 * @extends   jf.codegen.section.Base
 */
module.exports = class jfCodeGenSectionProperties extends jfCodeGenSectionBase {
    /**
     * Agrega una propiedad final, es decir, que no puede ser
     * modificada por las instancias.
     *
     * @param {Object} config Configuración a usar para construir la propiedad.
     */
    addFinalProperty(config)
    {
        if (config.override)
        {
            if (!Array.isArray(config.desc))
            {
                config.desc = [];
            }
        }
        const _value = config.value;
        const _type  = typeof _value;
        if (_type === 'object')
        {
            let _json = JSON.stringify(_value, null, 4);
            if (Array.isArray(_value) && String(_value[0]).indexOf(this.camelize(this.project)) === 0)
            {
                _json = _json.replace(/"/g, '');
            }
            else
            {
                _json = _json.replace(/"/g, "'");
            }
            config.value = _json.replace(/^/gm, '    ').trim();
        }
        if (!config.type)
        {
            config.type = _type;
        }
        return this.addProperty(config);
    }

    addProperty(config)
    {
        const _property = new jfCodeGenProperty(
            Object.assign(
                {
                    readonly : true
                },
                config
            )
        );
        if (!this.config)
        {
            this.config = {};
        }
        this.config[_property.name] = _property;
        return _property;
    }

    /**
     * Agrega una propiedad protegida que contiene los tipos de datos de las propiedades de la clase.
     * Su principal utilidad es la de inicializar las propiedades con los valores esperados.
     *
     * @method addPropertyTypes
     */
    addPropertyTypes(name = '_propertyTypes')
    {
        const _properties = this.config;
        if (_properties && typeof _properties === 'object')
        {
            const _names = Object.keys(_properties);
            if (_names.length)
            {
                const _requires = this.file.requires;
                const _result   = {};
                _names.sort().forEach(
                    name =>
                    {
                        const _property = _properties[name];
                        if (!_property.readonly)
                        {
                            let _type = jfCodeGenProperty.getType(_property.type);
                            if (_type)
                            {
                                const _isArray = _type.indexOf('[]') !== -1;
                                if (_isArray)
                                {
                                    _type = _type.replace('[]', '');
                                }
                                if (_type.indexOf('.') === -1)
                                {
                                    const _nativeType = this.camelize(_type);
                                    if (global[_nativeType])
                                    {
                                        _type = _nativeType;
                                    }
                                }
                                else
                                {
                                    if (!_requires.getItem(_type))
                                    {
                                        _requires.setItem(_type);
                                    }
                                    _type = this.camelize(_type);
                                }
                                _result[name] = _type;
                            }
                        }
                    }
                );
                if (Object.keys(_result).length)
                {
                    this.addProperty(
                        {
                            desc     : this.tr('Tipos de datos de las propiedades de la clase.').split('\n'),
                            name     : name,
                            rawval   : true,
                            override : true,
                            type     : 'object',
                            value    : jfCodeGenProperty.stringify(_result, this.indentSize)
                                .replace(/\'/g, '')
                                .replace(/:/g, ' :')
                        }
                    );
                }
            }
        }
    }

    /**
     * Agrega el campo a las propiedades a inicializar en el <em>_beforeInit</em>.
     *
     * @param {String} name Nombre del campo.
     *
     * @private
     */
    __addToInit(name)
    {
        const _property = this.getItem(name);
        if (_property && _property.defval)
        {
            const config = this.file;
            if (!config.defval)
            {
                config.defval = {};
            }
            config.defval[name] = _property.defval;
        }
    }

    /**
     * @override
     */
    _getDefault()
    {
        return {};
    }

    /**
     * @override
     */
    _parseItem(name, index)
    {
        super._parseItem(name, index);
        this.setItem(
            name,
            new jfCodeGenProperty(this.getItem(name))
        );
    }

    /**
     * @override
     */
    setItem(name, value)
    {
        super.setItem(name, value);
        this.__addToInit(name);
    }

    /**
     * @override
     */
    _validateItem(item)
    {
        return this.getItem(item).validate();
    }
};
