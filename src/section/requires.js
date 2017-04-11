const jfCodeGenSectionMixins = require('./mixins');
/**
 * Maneja las inclusiones de las dependencias de la clase.
 *
 * @namespace jf.codegen.section
 * @class     jf.codegen.section.Requires
 * @extends   jf.codegen.section.Mixins
 */
module.exports = class jfCodeGenSectionRequires extends jfCodeGenSectionMixins {
    /**
     * @override
     */
    parse()
    {
        const _base = this.get('file.base');
        if (_base)
        {
            this._parseItem(_base);
        }
        super.parse();
    }
};
