const jfCodeGenSectionBase = require('./base');
/**
 * Procesa las propiedades y métodos estáticos.
 *
 * @namespace jf.codegen.section
 * @class     jf.codegen.section.Statics
 * @extends   jf.codegen.section.Base
 */
module.exports = class jfCodeGenSectionStatics extends jfCodeGenSectionBase {
    onAfterParse()
    {
        const _config    = this.builder.config;
        const _ownConfig = _config[this.name];
        if (_ownConfig && _ownConfig.length)
        {
            const _properties = _config.properties;
            const _methods    = _config.methods;
            const _statics    = {
                properties : [],
                methods    : []
            };
            _ownConfig.forEach(
                (name) =>
                {
                    if (_properties[name])
                    {
                        _statics.properties.push(_properties[name]);
                        delete _properties[name];
                    }
                    else if (_methods[name])
                    {
                        _statics.methods.push(_methods[name]);
                        delete _methods[name];
                    }
                }
            );
            _config.statics = _statics;
        }
    }
};
