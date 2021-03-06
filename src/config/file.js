const dasherize            = require('../tpl/helpers/dasherize');
const jfCodeGenConfigBase  = require('./base');
const jfCodeGenSectionBase = require('../section/base');
const jfCodeGenTpl         = require('../tpl');
const path                 = require('path');
/**
 * Clase que maneja la configuración del archivo a generar.
 * Se apoya en las diferentes secciones.
 *
 * @namespace jf.codegen.config
 * @class     jf.codegen.config.File
 * @extends   jf.codegen.config.Base
 */
class jfCodeGenConfigFile extends jfCodeGenConfigBase {
    /**
     * @override
     */
    constructor(config)
    {
        super();
        /**
         * Clase base de la que extiende la clase siendo generada.
         *
         * @property base
         * @type     {String}
         */
        this.base = '';
        /**
         * Nombre del archivo de la configuración usada sin el directorio.
         *
         * @property basename
         * @type     {String}
         */
        this.basename = '';
        /**
         * Nombre de la clase a generar.
         *
         * @property class
         * @type     {String}
         */
        this.class = '';
        /**
         * Fecha de creación.
         *
         * @property created
         * @type     {Date}
         */
        this.created = (new Date()).toISOString();
        /**
         * Nombre del directorio con el archivo de la configuración usada.
         *
         * @property dirname
         * @type     {String}
         */
        this.dirname = '';
        /**
         * Ruta del archivo que tiene la configuración que está siendo procesada.
         *
         * @property filename
         * @type     {String}
         */
        this.filename = '';
        /**
         * Directorio del proyecto que hace uso del generador de código.
         * El uso de esta propiedad permite incluir código que se encuentra
         * en otro directorio diferente al de `jfCodeGen`.
         *
         * @property include
         * @type     {String}
         */
        this.include = null;
        /**
         * Nombre del método usado para extender una clase a partir de la clase base.
         * La mayoría de los sistemas de clases (Backbone, Ember, CoreObject, etc)
         * usan el método <em>extend</em> pero por si acaso permitimos configurarlo.
         *
         * @property method
         * @type     {String}
         */
        this.method = 'extend';
        /**
         * Listado de módulos a incluir.
         *
         * @property modules
         * @type     {Object}
         */
        this.modules = {};
        /**
         * Espacio de nombres de la clase generada.
         *
         * @property namespace
         * @type     {String}
         */
        this.namespace = 'jf';
        /**
         * Directorio de salida donde colocar el archivo.
         * Su principal uso es mostrar el archivo generado de manera relativa
         * a este directorio.
         * Si no se especifica se usa el mismo directorio donde se encuentra
         * el archivo con la configuración.
         *
         * @property outdir
         * @type     {String}
         */
        this.outdir = '';
        /**
         * Ruta completa del archivo de salida.
         * Si no se especifica se usa la misma rutaque el archivo con la
         * configuración cambiando la extensión.
         *
         * @property outfile
         * @type     {String}
         */
        this.outfile = '';
        /**
         * Ruta al directorio con el código fuente de los archivos.
         *
         * @property srcdir
         * @type     {String}
         */
        this.srcdir = null;
        /**
         * Plantilla a usar para generar el archivo.
         *
         * @property tpl
         * @type     {String}
         */
        this.tpl = '';
        /**
         * Si es `true` se aumenta la cantidad de información mostrada por pantalla.
         *
         * @property verbose
         * @type     {Boolean}
         */
        this.verbose = false;
        /**
         * Versión del archivo a generar.
         *
         * @property version
         * @type     {String}
         */
        this.version = '';
        //--------------------------------------------------------------------------------
        // Inicializamos la instancia con la configuración especificada.
        //--------------------------------------------------------------------------------
        if (config)
        {
            if (typeof config === 'string')
            {
                config = this._loadConfig(config);
            }
            if (typeof config === 'object')
            {
                this.emit('config', config);
                this.setProperties(config);
                this.constructor.defaultIndent = this.tpl.indexOf('.es7.') === -1 ? 8 : 4;
                // Asignamos las propiedades que corresponden con las secciones.
                this.__loadSections(config);
                this.class = this.camelize(this.class);
            }
        }
    }

    /**
     * Genera el archivo de salida.
     *
     * @param {Boolean} verbose Si es `true` se muestra por pantalla más información y el código generado.
     */
    generate(verbose = false)
    {
        // Procesamos las secciones y se disparan los eventos para que cada quien
        // se suscriba al momento que le interese modificar el estado de la aplicación.
        this.__iterate('parse');
        this.__iterate('validate');
        this.emit('before-context', this);
        const _context = this.toJSON();
        this.emit('after-context', this, _context);
        const _tpl = new jfCodeGenTpl(this);
        this.emit('before-render', this, _tpl);
        const _code = _tpl.render(_context).trim() + '\n';
        this.emit('after-render', this, _tpl, _code);
        // Verificamos si tiene extensión el archivo.
        let _outfile = this.outfile;
        if (!path.extname(_outfile))
        {
            const _tpl = this.tpl.split('.');
            if (_tpl[0] === 'class')
            {
                switch (_tpl[1])
                {
                    case 'es6':
                    case 'js':
                    case 'node':
                        _outfile += '.js';
                        break;
                    case 'es7':
                        _outfile += '.mjs';
                        break;
                    case 'php':
                        _outfile += '.php';
                        break;
                }
            }
        }
        if (verbose)
        {
            console.log(_code);
        }
        this.write(_outfile, _code);
    }

    /**
     * Itera sobre las secciones llamando el método especificado.
     *
     * @param {String} method Método a ejecutar en cada una de las secciones.
     *
     * @private
     */
    __iterate(method)
    {
        for (let _property of Object.keys(this))
        {
            const _section = this[_property];
            if (_section instanceof jfCodeGenSectionBase)
            {
                const _name = dasherize(method);
                this.emit('before-' + _name, this, _section);
                _section[method]();
                this.emit('after-' + _name, this, _section);
            }
        }
    }

    /**
     * Carga la configuración desde un archivo.
     * Se aceptan JSON y YAML.
     *
     * @param {String} filename Ruta del archivo a leer.
     *
     * @return {Object}
     *
     * @protected
     */
    _loadConfig(filename)
    {
        let _config;
        const _ext = path.extname(filename);
        switch (_ext)
        {
            case '.json':
                _config = require(filename);
                break;
            case '.yaml':
            case '.yml':
                _config = require('yamljs').load(filename);
                break;
        }
        if (_config)
        {
            const _dirname = path.dirname(filename);
            _config        = Object.assign(
                {
                    basename : path.basename(filename),
                    class    : path.basename(filename, _ext),
                    dirname  : _dirname,
                    filename : filename,
                    outdir   : _dirname,
                    outfile  : filename.replace(new RegExp(_ext + '$'), '.js'),
                    srcdir   : _dirname
                },
                _config
            );
            if (!_config.namespace)
            {
                const _parts = _config.class.split('.');
                if (_parts.length > 1)
                {
                    _config.class     = _parts.pop();
                    _config.namespace = _parts.join('.');
                }
            }
        }
        else
        {
            this.error('Configuración vacía: %s', filename);
        }
        return _config;
    }

    /**
     * Carga las secciones de la configuración.
     *
     * @param {Object} config Configuración a usar para construir el archivo final.
     *
     * @private
     */
    __loadSections(config)
    {
        this.emit('before-sections', this, config);
        const _include = config.include;
        const _files   = [];
        if (_include)
        {
            const _path = path.join(_include, 'section');
            if (this.exists(_path))
            {
                _files.push(...this.scandir(path.join(_include, 'section')));
            }
        }
        _files.push(...this.scandir(path.join(__dirname, '..', 'section')));
        // Asignamos las propiedades que corresponden con las secciones.
        for (let _file of _files)
        {
            const _name = path.basename(_file, '.js');
            if (!(this[_name] instanceof jfCodeGenSectionBase) && _name.indexOf('base') === -1)
            {
                const _config = _name in config
                    ? config[_name]
                    : false;
                // Emitimos el evento con la configuración por si a alguien le
                // interesa realizar alguna modificación antes de crear la instancia.
                this.emit('section-config', _name, _config);
                const _section = this[_name] = new (require(_file))(this, _config);
                // Emitimos el evento de que la sección ha sido inicializada.
                this.emit('section-init', _section);
                delete config[_name];
            }
        }
        this.emit('after-sections', this, config);
    }

    /**
     * Resuelve una variable para una sección específica.
     * Se dispara un evento para que cualquier aplicación que haga uso
     * de jfDocGen puede ponerse a la escucha y resolver este valor.
     *
     * @method resolve
     *
     * @param {String} section  Sección que requiere la resolución.
     * @param {String} value    Valor a resolver.
     *
     * @return {String} Valor de la variable luego de resolverse.
     */
    resolve(section, value)
    {
        const _data = {
            resolved : false,
            section,
            value
        };
        this.emit('resolve', _data);
        if (_data.resolved)
        {
            value = _data.value;
        }
        else
        {
            switch (section)
            {
                case 'mixins':
                case 'requires':
                    value = path.resolve(this.srcdir, value);
                    break;
                default:
                    break;
            }
        }
        return value;
    }
}
require('augment-object').augmentClass(jfCodeGenConfigFile, require('@jf/fs'));
//------------------------------------------------------------------------------
// Exportamos la clase
//------------------------------------------------------------------------------
module.exports = jfCodeGenConfigFile;
