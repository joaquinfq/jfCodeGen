const jfCodeGenConfigBase = require('./base');
const jfCodeGenProperty   = require('./property');
const beautify            = require('js-beautify').js_beautify;
const docType             = require('../tpl/helpers/doc-type');
const jshint              = require('jshint').JSHINT;
/**
 * Configuración predefinida para el embellecedor del código y el validador.
 *
 * @type {Object}
 */
const defaultConfig       = {
    beautify : {
        'brace_style'                 : 'expand,preserve-inline',
        'break_chained_methods'       : true,
        'end_with_newline'            : false,
        'eol'                         : '\n',
        'eval_code'                   : false,
        'indent_char'                 : ' ',
        'indent_level'                : 4,
        'indent_size'                 : 4,
        'indent_with_tabs'            : false,
        'jslint_happy'                : false,
        'keep_array_indentation'      : true,
        'keep_function_indentation'   : true,
        'max_preserve_newlines'       : 1,
        'preserve_newlines'           : false,
        'space_after_anon_function'   : true,
        'space_before_conditional'    : true,
        'unescape_strings'            : true,
        'wrap_attributes'             : 'force-aligned',
        'wrap_attributes_indent_size' : 4,
        'wrap_line_length'            : 120
    },
    jshint   : JSON.parse(
        require('jf-file-system').i().read(
            __dirname,
            '..',
            '..',
            '.jshintrc'
        )
    )
};
/**
 * Representa la configuración de un método de una clase.
 *
 * @namespace jf.codegen.config
 * @class     jf.codegen.config.Method
 * @extends   jf.codegen.config.Base
 */
module.exports = class jfCodeGenConfigMethod extends jfCodeGenConfigBase {
    constructor(config)
    {
        super(config);
        /**
         * Cuerpo del método.
         *
         * @property body
         * @type     {String}
         */
        this.body = '';
        /**
         * Indica si debe embellecerse el código generado.
         *
         * @property format
         * @type     {Boolean}
         */
        this.format = true;
        /**
         * Cadena usada para indentar el código.
         *
         * @property indent
         * @type     {String}
         */
        this.indent = '        ';
        /**
         * Si es `false` el código no será analizado por el módulo `jshint` en busca de errores.
         * También puede especificarse un objeto para modificar algún parámetro de la
         * configuración de `jshint`.
         * Debería evitarse el uso de esta opción a `false`.
         *
         * @property jshint
         * @type     {Boolean|Object}
         */
        this.jshint = {};
        /**
         * Se usa para indicar que el método está sobrescribiendo un método de la clase padre.
         *
         * @property override
         * @type     {Boolean}
         */
        this.override = false;
        /**
         * Almacena los parámetros que usa el método.
         *
         * @property params
         * @type     {Object[]}
         */
        this.params = [];
        /**
         * Especifica el tipo de datos devuelto por el método.
         *
         * @property returns;
         * @type    {String}
         */
        this.returns = '';
        /**
         * Indica si el método de la clase padre debe ser llamado `after` o `before`
         * del método del modelo que lo sobrescribe.
         * Si no se especifica esta opción y el método está siendo sobrescrito se debe
         * recordar llamar de manera explícita en el código al método sobrescrito.
         *
         * @property super
         * @type    {String}
         */
        this.super = '';
        //---------------------------------------------------------------------
        this.setProperties(config);
        this._parseParams();
        this.formatCode();
    }

    /**
     * @override
     */
    formatCode()
    {
        const _code = this.body;
        if (_code)
        {
            this.body = beautify(_code, defaultConfig.beautify).replace(/^/gm, this.indent).trim();
        }
        if (this.returns)
        {
            let _returns = this.returns.trim();
            if (_returns[0] === '(')
            {
                _returns = _returns.replace('(', '{').replace(')', '}');
            }
            else if (_returns[0] !== '{')
            {
                _returns = docType(_returns);
            }
            this.returns = _returns;
        }
    }

    /**
     * Analiza los parámetros de la función.
     *
     * @protected
     */
    _parseParams()
    {
        const _newParams = [];
        const _params    = this.params;
        if (_params && _params.length)
        {
            const _names = [];
            const _types = [];
            for (let _param of _params)
            {
                _param = new jfCodeGenConfigProperty(_param);
                _names.push(_param.name);
                _types.push(_param.type);
                _newParams.push(_param);
            }
            if (_params.length > 1)
            {
                const _max = {
                    name : Math.max(..._names.map(name => name.length)),
                    type : Math.max(..._types.map(name => name.length))
                };
                _newParams.forEach(
                    (param) =>
                    {
                        ['name', 'type'].forEach(
                            prop => param[prop] += ' '.repeat(_max[prop] - param[prop].length)
                        );
                    }
                );
            }
        }
        this.params = _newParams;
    }

    /**
     * @override
     */
    validate()
    {
        const _code  = this.body;
        let _isValid = false;
        if (this.jshint === false)
        {
            _isValid = true;
        }
        else
        {
            const _params = this.params;
            const _predef = this.jshint || {};
            if (_params && _params.length)
            {
                _params.forEach(
                    param => _predef[param.name] = true
                );
            }
            _isValid = jshint(_code, defaultConfig.jshint, _predef);
            if (!_isValid)
            {
                const _error = jshint.errors[0];
                this.log(
                    'error',
                    '%s\n%s^ %s',
                    _code.split('\n')[_error.line - 1],
                    ' '.repeat(_error.character - 1),
                    _error.reason
                );
                // @TODO: Pluralizar la etiqueta.
                this.error(
                    'JSHINT: Se ha(n) encontrado %s error(es) en el método %s',
                    jshint.errors.length,
                    this.name
                );
            }
        }
        if (_isValid)
        {
            if (_code.match(/[\W\D']?return[\W\D']/) && !this.override && this.returns === '')
            {
                this.error(
                    'El método %s tiene `return` pero la clave `returns` no se ha encontrado en la configuración.',
                    this.name
                );
            }
        }
        return _isValid;
    }
};
