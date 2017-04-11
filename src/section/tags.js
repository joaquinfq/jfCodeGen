const jfCodeGenSectionBase = require('./base');
/**
 * Maneja las etiquetas `JSDoc` a agregar a la cabecera.
 *
 * @name    jf.codegen.section
 * @class   jf.codegen.section.Tags
 * @extends jf.codegen.section.Base
 */
module.exports = class jfCodeGenSectionTags extends jfCodeGenSectionBase {
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
    setItem(name, value)
    {
        if (value)
        {
            if (Array.isArray(value))
            {
                value.forEach(text => this.setItem(name, text));
            }
            else if (typeof value === 'string')
            {
                const _config = this.config;
                const _values = _config[name];
                if (Array.isArray(_values))
                {
                    if (_values.indexOf(value) === -1)
                    {
                        _values.push(value);
                    }
                }
                else
                {
                    _config[name] = [
                        value
                    ];
                }
            }
            else
            {
                this.error('Valor incorrecto para el tag %s: %s -- %s', '@' + name, typeof value, JSON.stringify(value));
            }
        }
    }

    /**
     * @override
     */
    toJSON()
    {
        const _tags   = [];
        const _config = this.config;
        if (_config)
        {
            // A menor valor, más arriba se coloca.
            const _order  = {
                namespace : -60,
                class     : -50,
                extends   : -40,
                uses      : -30,
                requires  : -20,
                version   : -10,
                see       : 10,
                notes     : 20
            };
            const _names  = Object.keys(_config).sort(
                (name1, name2) =>
                {
                    let _result = 0;
                    if (name1 in _order)
                    {
                        _result = name2 in _order
                            ? _order[name1] - _order[name2]
                            : _order[name1];
                    }
                    else if (name2 in _order)
                    {
                        _result = -_order[name2];
                    }
                    else
                    {
                        _result = name1.localeCompare(name2);
                    }
                    return _result;
                }
            );
            const _length = Math.max(..._names.map(name => name.length));
            for (let _name of _names)
            {
                const _sname = _name + ' '.repeat(_length - _name.length);
                let _values  = _config[_name];
                if (!Array.isArray(_values))
                {
                    _values = [_values];
                }
                for (let _value of _values.sort((v1, v2) => v1.toLowerCase().localeCompare(v2.toLowerCase())))
                {
                    _tags.push(
                        `@${_sname} ${_value}`
                    );
                }
            }
        }
        return _tags;
    }

    /**
     * @override
     */
    validate()
    {
        const _file      = this.file;
        const _map       = {
            base   : 'extends',
            mixins : 'uses'
        };
        let _class       = _file.class;
        const _namespace = _file.namespace;
        if (_namespace)
        {
            _class = `${_namespace}.${_class}`;
        }
        this.setItem('namespace', _namespace);
        this.setItem('class', _class);
        ['base', 'requires', 'version'/*, 'created'*/].forEach(
            name =>
            {
                const _value = _file[name];
                if (_value && (!Array.isArray(_value) || _value.length))
                {
                    if (name in _map)
                    {
                        name = _map[name];
                    }
                    if (_value instanceof jfCodeGenSectionBase)
                    {
                        _value.iterate(
                            item => {
                                if (name !== 'requires' || item !== _file.base)
                                {
                                    this.setItem(name, item)
                                }
                            }
                        );
                    }
                    else
                    {
                        this.setItem(name, _value);
                    }
                }
            }
        );
        super.validate();
    }

    /**
     * @override
     */
    _validateItem(item)
    {
        return typeof item === 'string' || Array.isArray(item);
    }
};
