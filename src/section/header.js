const jfCodeGenSectionBase = require('./base');
/**
 * Procesa la cabecera del archivo.
 *
 * @namespace jf.codegen.section
 * @class     jf.codegen.section.Header
 * @extends   jf.codegen.section.Base
 */
module.exports = class jfCodeGenSectionHeader extends jfCodeGenSectionBase {
    /**
     * @override
     */
    _getDefault()
    {
        return [];
    }
    /**
     * @override
     */
    toJSON()
    {
        const _config = this.config;

        return Array.isArray(_config)
            ? _config.join('\n')
            : super.toJSON();
    }
};
