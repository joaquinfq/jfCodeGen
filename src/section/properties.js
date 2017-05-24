const jfCodeGenSectionBase = require('./base');
const jfCodeGenProperty    = require('../config/property');
/**
 * Maneja los campos encontrados en la configuración del modelo.
 *
 * @namespace jf.codegen.section.Properties
 * @class     jf.codegen.section.Properties
 * @extends   jf.codegen.section.Base
 */
module.exports = class jfCodeGenSectionProperties extends jfCodeGenSectionBase
{
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
                            let _type = _property.type;
                            if (_type)
                            {
                                const _isArray = _type.indexOf('[]') !== -1;
                                _type = _type
                                    .replace('[]', '')
                                    .replace('|null', '');
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
                                _result[name] = _isArray
                                    ? [ _type ]
                                    : _type;
                            }
                        }
                    }
                );
                if (Object.keys(_result).length)
                {
                    const _prop = this.addProperty(
                        {
                            desc     : this.tr('Tipos de datos de las propiedades de la clase.').split('\n'),
                            name     : name,
                            override : true,
                            value    : _result
                        }
                    );
                    _prop.value = _prop.value.replace(/\'/g, '')
                }
            }
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
    _validateItem(item)
    {
        return this.getItem(item).validate();
    }
};
