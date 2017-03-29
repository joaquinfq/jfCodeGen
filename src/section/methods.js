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
module.exports = class jfCodeGenSectionMethods extends jfCodeGenSectionBase {
    /**
     * @override
     * /
     constructor(file, config)
     {
         super(file, config);
         file.on('before-render', () => this.__checkBeforeInit());
     }*/
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
                body     : `return '${_file.namespace}.${_file.class}';`,
                desc     : this.tr('Devuelve una cadena que representa al objeto.').split('\n'),
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

    createBuilder(name, values, description, returns)
    {
        const _keys     = {};
        const _requires = this.file.requires;
        for (let _key of Object.keys(values).sort())
        {
            const _value = values[_key];
            const _cc    = this.camelize(_value);
            _requires.setItem(_value);
            _keys[_key] = [
                `    case '${_key}':`,
                `        _model = new ${_cc}();`,
                `        _model.setProperties(config);`,
                '        break;'
            ];
        }
        const _body  = [
            'if (!config || typeof config !== \'object\')',
            '{',
            '    config = {};',
            '}',
            'let _model = null;',
            'switch (name)',
            '{'
        ];
        const _names = Object.keys(_keys).sort();
        for (let _key of _names)
        {
            _body.push(..._keys[_key]);
        }
        _body.push('}', '', 'return _model;');
        if (!this.methods)
        {
            this.methods = {};
        }
        this.methods[name] = {
            body     : _body.join('\n').replace(/^/gm, '        ').trim(),
            desc     : description.split('\n'),
            format   : false,
            override : true,
            name     : name,
            params   : {
                name   : 'Name of model to build (String)',
                config : 'Config to apply to new instance (Object?)'
            },
            returns  : `{${returns}} Model required.`
        };
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
        super.setItem(name, new jfCodeGenMethod(value));
    }

    /**
     * @override
     */
    _validateItem(item)
    {
        return item.jshint
            ? item.validate()
            : true;
    }
};
