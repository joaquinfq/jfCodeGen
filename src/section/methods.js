const jfCodeGenSectionBase = require('./base');
const jfCodeGenMethod      = require('../config/method');
const format               = require('util').format;
const path                 = require('path');
const indent               = require('../tpl/helpers/indent');
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
     * Verifica si es necesario agregar el método <em>_beforeInit</em> para inicializar las variables
     * que se pasan por referencias como los arrays y objetos.
     *
     * En caso de ser necesario lo agrega.
     *
     * @private
     */
    __checkBeforeInit()
    {
        const _init = this.defval;
        if (_init && typeof _init === 'object')
        {
            const _lines  = [];
            const _format = 'this._initProperty(\'%s\', %s);';
            const _indent = this.indent + '    ';
            Object.keys(_init).sort().forEach(
                (property) =>
                {
                    _lines.push(
                        format(
                            _format,
                            property,
                            indent(
                                {
                                    value : _init[property]
                                },
                                _indent.length
                            )
                        )
                    );
                }
            );
            if (_lines.length)
            {
                this.setItem(
                    '_initProperties',
                    {
                        body   : _lines.join('\n' + _indent),
                        desc   : [
                            'Inicializa las propiedades del modelo que corresponden con objetos.',
                            'Las propiedades que representan objetos al ser pasadas por referencia',
                            'al crear la instancia del modelo se inicializan acá para evitar la',
                            'modificación inesperada por el uso de su referencia.'
                        ],
                        format : false,
                        super  : 'after'
                    }
                );
                this._parseItem('_initProperties');
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
        item.globals = this.get('file.requires.config');
        return item.eslint === false
            ? true
            : item.validate();
    }
};
