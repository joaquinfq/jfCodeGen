const jfCodeGenBase = require('./base');
const fs            = require('@jf/fs').i();
const hbs           = require('handlebars');
const path          = require('path');
/**
 * Maneja lo relacionado con la plantilla y la presentación del resultado.
 *
 * @namespace jf.codegen
 * @class     jf.codegen.Tpl
 * @extends   jf.codegen.Base
 */
module.exports = class jfCodeGenTpl extends jfCodeGenBase {
    constructor(config)
    {
        super();
        /**
         * Listado de plantillas parciales agregadas.
         *
         * @property __partials
         * @type     {Object}
         */
        this.__partials = {};
        /**
         * Manejador de la plantilla.
         *
         * @property tpl
         * @type     {Function}
         */
        this.tpl = null;
        //---------------------------------------------------------------------
        const _includeDir = config.include
            ? path.join(config.include, 'tpl')
            : '';
        const _tplDir     = path.join(__dirname, 'tpl');
        const _tplName    = config.tpl || 'simple.hbs';
        // Cargamos la plantilla con los helpers y los parciales.
        this.loadTpl(path.join(_includeDir, _tplName)) || this.loadTpl(path.join(_tplDir, _tplName));
        if (this.tpl)
        {
            [_includeDir, _tplDir].forEach(
                dir =>
                {
                    this.__addHelpers(dir);
                    this.__addPartials(dir);
                }
            );
        }
    }

    /**
     * Agrega los helpers presentes en un directorio de manera recursiva.
     *
     * @param {String} dir Directorio donde se buscarán los helpers.
     *
     * @private
     */
    __addHelpers(dir)
    {
        dir = path.join(dir, 'helpers');
        if (fs.exists(dir))
        {
            fs.scandir(dir, /\.js$/).forEach(
                (filename) =>
                {
                    const _name = path.basename(filename, '.js');
                    if (!(_name in hbs.helpers))
                    {
                        hbs.registerHelper(_name, require(filename));
                    }
                }
            );
        }
    }

    /**
     * Agrega las plantillas parciales presentes en un directorio de manera recursiva.
     *
     * @param {String} dir Directorio donde se buscarán las plantillas.
     *
     * @private
     */
    __addPartials(dir)
    {
        dir = path.join(dir, 'partials');
        if (fs.exists(dir))
        {
            fs.scandir(dir).forEach(
                (filename) =>
                {
                    if (!this.__partials[filename])
                    {
                        this.__partials[filename] = 1;
                        hbs.registerPartial(
                            path.basename(filename, '.hbs').replace(/[^\w\d]+/g, '-'),
                            fs.read(filename)
                        );
                    }
                }
            );
        }
    }

    /**
     * Carga la plantilla a usar para renderizar la configuración.
     *
     * @method loadTpl
     *
     * @param {String} filename Ruta de la plantilla a leer.
     */
    loadTpl(filename)
    {
        if (fs.exists(filename))
        {
            this.log('info', '', 'Leyendo plantilla: %s', path.basename(filename));
            this.tpl = hbs.compile(
                fs.read(filename),
                {
                    noEscape : true
                }
            );
        }
        return !!this.tpl;
    }

    /**
     * Renderiza la plantilla para generar el código.
     *
     * @param {Object} config Configuración leída desde el archivo.
     *
     * @return {String} Código generado con la plantilla.
     */
    render(config)
    {
        return this.tpl(config)
            .replace(/\n+ *\n+/gm, '\n')
            .replace(/\s+,/gm, ',')
            .replace(/, +$/g, ',')
            .replace(/,+/g, ',')
            .replace(/,(\s+})/gm, '$1')
            .replace(/ +$/gm, '');
    }
};
