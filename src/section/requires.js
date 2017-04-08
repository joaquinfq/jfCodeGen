const jfCodeGenSectionBase = require('./base');
/**
 * Maneja las inclusiones de las dependencias de la clase.
 *
 * @namespace jf.codegen.section.Requires
 * @class     jf.codegen.section.Requires
 * @extends   jf.codegen.section.Base
 */
module.exports = class jfCodeGenSectionRequires extends jfCodeGenSectionBase {
    /**
     * @override
     */
    constructor(file, config)
    {
        super(file, config);
        file.on('before-render', file => this.__onBeforeRender(file));
    }

    /**
     * @override
     */
    _getDefault()
    {
        return [];
    }

    /**
     * Callback a ejecutar en el evento `before-render`.
     *
     * @private
     */
    __onBeforeRender()
    {
        const _requires = this.config;
        if (_requires)
        {
            if (_requires.length)
            {
                let _index = _requires.length - 1;
                do
                {
                    const _require = _requires[_index];
                    if (!this._checkFile(_require))
                    {
                        _requires.splice(_index, 1);
                    }
                } while (_index--);
            }
        }
    }

    /**
     * @override
     */
    toJSON()
    {
        let _requires = this.config;
        if (_requires && _requires.length)
        {
            const _file  = this.file;
            _requires    = _requires
                .filter(
                    (require, index, requires) => requires.indexOf(require) === index
                );
            _requires    = _requires.sort(
                (value1, value2) => value1.toLowerCase().localeCompare(value2.toLowerCase())
            );
            const _index = _requires.indexOf(_file.base);
            if (_index !== -1)
            {
                _requires.splice(_index, 1);
            }
        }
        return _requires;
    }
};
