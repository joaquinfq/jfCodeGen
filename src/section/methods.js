const jfCodeGenSectionBase = require('./base');
const jfCodeGenMethod      = require('../config/method');
const path                 = require('path');
/**
 * Clase para configurar los métodos a generar.
 *
 * @namespace jf.codegen.section.Methods
 * @class     jf.codegen.section.Methods
 * @extends   jf.codegen.section.Base
 */
module.exports = class jfCodeGenSectionMethods extends jfCodeGenSectionBase
{
    /**
     * Agrega un método a la configuración de métodos.
     *
     * @param {Object} config Configuración del método a agregar.
     */
    addMethod(config)
    {
        this.setItem(config.name, config);
    }

    /**
     * Agrega el método `toString` a la clase para mostrar su nombre.
     *
     * @method addToString
     */
    addToString()
    {
        const _file = this.file;
        this.setItem(
            'toString',
            {
                body     : `return '[class ${_file.namespace}.${_file.class}]';`,
                desc     : this.tr('Devuelve una cadena que representa al objeto.'),
                override : true,
                returns  : 'String'
            }
        );
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
        const _method = this.getItem(name);
        if (_method)
        {
            this.setItem(name, _method);
        }
    }

    /**
     * @override
     */
    setItem(name, value)
    {
        if (!value.name)
        {
            value.name = name;
        }
        super.setItem(name, new jfCodeGenMethod(value));
    }

    /**
     * @override
     */
    _sortKeys(key1, key2)
    {
        // Por conveniencia, ponemos de primero a los constructores.
        // El resto lo ordenamos alfabéticamente.
        return key1 === 'constructor'
            ? -1
            : key2 === 'constructor'
                   ? 1
                   : super._sortKeys(key1, key2);
    }

    /**
     * @override
     */
    _validateItem(item)
    {
        item         = this.getItem(item);
        item.globals = Object.values(this.get('file.requires.config'));
        return item.eslint === false
            ? true
            : item.validate();
    }
};
