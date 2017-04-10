const beautify                = require('js-beautify').js_beautify;
const docType                 = require('../tpl/helpers/doc-type');
const eslint                  = require('eslint/lib/eslint');
const jfCodeGenConfigBase     = require('./base');
const jfCodeGenConfigProperty = require('./property');
const path                    = require('path');
const eslintConfig            = new (require('eslint/lib/config'))(
    {
        useEslintrc : false,
        baseConfig  : path.resolve(__dirname, '..', '..', '.eslintrc.yml')
    }
);
/**
 * Configuración predefinida para el embellecedor del código.
 *
 * @type {Object}
 */
const beautifyConfig          = {
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
         * Si es `false` el código no será analizado por el módulo `eslint` en busca de errores.
         * También puede especificarse un objeto para modificar algún parámetro de la
         * configuración de `eslint`.
         * Debería evitarse el uso de esta opción a `false`.
         *
         * @property eslint
         * @type     {Boolean|Object}
         */
        this.eslint = {};
        /**
         * Indica si debe embellecerse el código generado.
         *
         * @property format
         * @type     {Boolean}
         */
        this.format = false;
        /**
         * Cadena usada para indentar el código.
         *
         * @property indent
         * @type     {String}
         */
        this.indent = '        ';
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
         * @property return;
         * @type    {String}
         */
        this.return = '';
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
        const _code = this.body.replace(/^/gm, this.indent).replace(/[ \t]+$/gm, '').trim();
        if (this.format)
        {
            this.body = beautify(_code, beautifyConfig).trim();
        }
        if (this.return)
        {
            let _return = this.return.trim();
            if (_return[0] === '(')
            {
                _return = _return.replace('(', '{').replace(')', '}');
            }
            else if (_return[0] !== '{')
            {
                _return = docType(_return);
            }
            this.return = _return;
        }
        this.body = _code;
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
                if (typeof _param === 'string')
                {
                    const _def = jfCodeGenConfigBase.parseDefinition(_param);
                    _param     = {
                        desc   : _def[0],
                        type   : _def[1],
                        defval : _def[2],
                        name   : _def[3]
                    };
                }
                _param = new jfCodeGenConfigProperty(_param);
                _names.push(_param.name);
                _types.push(_param.type);
                _newParams.push(_param.toJSON());
            }
            const _max = {
                name : Math.max(..._names.map(name => name.length)),
                type : Math.max(..._types.map(name => name.length))
            };
            _newParams.forEach(
                param => ['name', 'type'].forEach(
                    prop =>
                    {
                        const _name         = param[prop];
                        param[prop + 'Pad'] = _name + ' '.repeat(_max[prop] - _name.length)
                    }
                )
            );

        }
        this.params = _newParams;
    }

    /**
     * @override
     */
    validate()
    {
        const _code   = this.body;
        const _eslint = this.eslint;
        let _isValid  = false;
        if (_eslint === false)
        {
            _isValid = true;
        }
        else if (_code)
        {
            const _params = this.params;
            const _names  = [];
            if (_params && _params.length)
            {
                _params.forEach(param => _names.push(param.name.trim()));
            }
            const _globals = _eslint.globals
                ? `/*global ${_eslint.globals.join(' ')}*/`
                : '';
            const _wrapped = `
${_globals}
(function(${_names.join(', ')})
{
    ${_code.replace(/^    /gm, '').replace(/[ \t]+$/gm, '')}
}
)();
`;
            const _config  = eslintConfig.getConfig();
            if (_config.rules)
            {
                Object.assign(_config.rules, _eslint.rules);
            }
            const _errors = eslint.verify(_wrapped, _config);
            if (_errors.length)
            {
                const _lines = _wrapped.split('\n');
                _errors.forEach(
                    error => this.log(
                        'error',
                        '',
                        'ESLINT %s\n%s\n%s^ %s (%s:%s)',
                        error.ruleId,
                        _lines[error.line - 1],
                        ' '.repeat(error.column - 1),
                        error.message,
                        error.line,
                        error.column
                    )
                );
                // @TODO: Pluralizar la etiqueta.
                this.error(
                    'ESLINT: Se ha(n) encontrado %s error(es) en el método %s',
                    _errors.length,
                    this.name
                );
            }
            else
            {
                _isValid = true;
            }
        }
        else
        {
            _isValid = true;
        }
        if (_isValid)
        {
            if (_code.match(/[\W\D']?return[\W\D']/) && !this.override && this.return === '')
            {
                this.error(
                    'El método %s tiene `return` pero la clave `return` no se ha encontrado en la configuración.',
                    this.name
                );
            }
        }
        return _isValid;
    }
};
