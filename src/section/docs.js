const jfCodeGenSectionBase = require('./base');
/**
 * Maneja la documentación de la clase.
 *
 * @namespace jf.codegen.section
 * @class     jf.codegen.section.Docs
 * @extends   jf.codegen.section.Base
 */
module.exports = class jfCodeGenSectionDocs extends jfCodeGenSectionBase {
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
    _parseItem(name, index)
    {
        super._parseItem(name, index);
        const _property = this.getItem(index);
        if (_property && typeof _property === 'string')
        {
            const _doc = this.parseLink(_property);
            this.file.tags.setItem('see', `{@link ${_doc.url}|${_doc.desc}}`);
        }
    }

    /**
     * Analiza un enlace y lo devuelve como un objeto.
     *
     * @method parseLink
     *
     * @param {String} link Enlace a analizar.
     *
     * @return {Object} Enlace formateado.
     */
    parseLink(link)
    {
        const _link = link.trim().split(/\s*\|\s*/);
        if (!_link[0])
        {
            this.error('Descripción incorrecta en enlace %s', link);
        }
        if (!_link[1])
        {
            this.error('URL incorrecta en enlace %s', link);
        }
        return {
            desc : _link[0],
            url  : _link[1]
        };
    }

    /**
     * @override
     */
    _validateItem(item)
    {
        return typeof item.desc === 'string' && typeof item.url === 'string' && item.desc && item.url;
    }
};
