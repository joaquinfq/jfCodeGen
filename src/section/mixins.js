const jfCodeGenSectionBase = require('./base');
/**
 * Maneja todo lo relacionado con los mixins a aplicar a una clase.
 *
 * @namespace jf.codegen.section
 * @class     jf.codegen.section.Mixins
 * @extends   jf.codegen.section.Base
 */
module.exports = class jfCodeGenSectionMixins extends jfCodeGenSectionBase {
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
    _parseItem(item)
    {
        if (item.indexOf('.') === -1)
        {
            delete this.config[item];
        }
        else
        {
            this.setItem(item, this.getItem(item));
        }
    }

    /**
     * @override
     */
    setItem(name, item)
    {
        if (!item)
        {
            item = this.camelize(name);
        }
        super.setItem(name, item);
    }

    /**
     * @override
     */
    toJSON()
    {
        let _requires = this.config;
        if (_requires)
        {
            if (Array.isArray(_requires))
            {
                if (_requires.length)
                {
                    const _file = this.file;
                    _requires   = _requires
                        .sort((r1, r2) => r1.name.toLowerCase().localeCompare(r2.name.toLowerCase()))
                        .map(r => r.class.indexOf(_file.base) === -1);
                }
                else
                {
                    _requires = false;
                }
            }
            else if (Object.keys(_requires).length === 0)
            {
                _requires = false;
            }
        }
        return _requires;
    }

    /**
     * @override
     */
    validate()
    {
        super.validate();
        const _requires = this.config;
        if (_requires)
        {
            if (_requires.length)
            {
                let _index = _requires.length - 1;
                do
                {
                    const _require = _requires[_index][0];
                    if (!this._checkFile(_require))
                    {
                        _requires.splice(_index, 1);
                    }
                } while (_index--);
            }
        }
    }
};
