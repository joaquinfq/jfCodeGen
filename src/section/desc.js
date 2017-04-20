const jfCodeGenSectionBase = require('./base');
/**
 * Procesa la descripción del archivo
 *
 * @namespace jf.codegen.section
 * @class     jf.codegen.section.Desc
 * @extends   jf.codegen.section.Base
 */
module.exports = class jfCodeGenSectionDesc extends jfCodeGenSectionBase
{
    /**
     * @override
     */
    constructor(file, config)
    {
        super(file, config);
        this.required = true;
    }

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
    parse()
    {
        super.parse();
        let _desc = this.config;
        if (_desc && !Array.isArray(_desc))
        {
            _desc = _desc.split('\n');
        }
        if (Array.isArray(_desc))
        {
            if (_desc.length)
            {
                this.config = _desc = _desc.filter((d, i, a) => !!d && a.indexOf(d) === i);
            }
            if (!_desc.length)
            {
                const _file = this.file;
                _file.tags.setItem(
                    'todo',
                    this.tr(
                        'Escribir descripción de la clase `%s.%s`.',
                        _file.namespace,
                        _file.class
                    )
                );
                this.config = [this.tr('Sin descripción.')]
            }
        }
    }

    /**
     * @override
     */
    _validateConfig()
    {
        super._validateConfig();
        let _config = this.config;
        if (Array.isArray(_config))
        {
            _config = _config.join('\n').trim();
        }
        if (typeof _config === 'string')
        {
            if (_config.length < this.file.minDescLength)
            {
                this.error('La descripción es demasiado corta. Por favor, agregue algún comentario adicional.');
            }
            this.config = _config.split('\n');
        }
        if (!Array.isArray(this.config))
        {
            this.error('Tipo incorrecto para la sección.');
        }
    }
};
