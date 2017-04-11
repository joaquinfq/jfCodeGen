const jfCodeGenBase = require('../base');
const fs            = require('fs');
/**
 * Clase base para el resto de clases del generador de código..
 *
 * @namespace jf.codegen.section
 * @class     jf.codegen.section.Base
 * @extends   jf.codegen.Base
 */
module.exports = class jfCodeGenSectionBase extends jfCodeGenBase {
    /**
     * @override
     */
    constructor(file, config)
    {
        super();
        /**
         * Configuración de la sección usada para inicializar la instancia.
         *
         * @property config
         * @type     {Object}
         */
        this.config = config;
        /**
         * Generador del archivo.
         *
         * @property file
         * @type     {config.File}
         */
        this.file = file;
        /**
         * Cantidad de espacios en blanco a usar para indentar los objetos
         * usando el método `stringify`.
         *
         * @property indentSize
         * @type     {Number}
         */
        this.indentSize = file.tpl.indexOf('.node.') === -1 ? 4 : 8;
        /**
         * Nombre de la sección.
         * Debe coincidir con el nombre de la clave en el archivo YAML leído.
         * Si no se especifica se construye a partir del nombre del archivo.
         *
         * @property name
         * @type     {String}
         */
        this.name = this.constructor.name.replace(/^.*Section/, '').toLowerCase();
        /**
         * Indica si la clave es obligatoria en la configuración.
         *
         * @property required
         * @type     {Boolean}
         */
        this.required = false;
        //---------------------------------------------------------------------
        this._validateConfig();
    }

    /**
     * Verifica si el archivo requerido existe o es válido para incluirlo.
     *
     * @param {String} filename Ruta completa del archivo a verificar.
     *
     * @return {Boolean} TRUE si el archivo existe y se puede incluir.
     *
     * @protected
     */
    _checkFile(filename)
    {
        let _filename;
        try
        {
            // Si se quiere evitar la comprobación, el `resolver`
            // puede devolver un valor `falsy`.
            _filename = this.file.resolve(this.name, filename);
            if (_filename)
            {
                _filename = fs.realpathSync(_filename);
            }
        }
        catch (e)
        {
            _filename = filename;
        }
        if (_filename)
        {
            if (!fs.existsSync(_filename))
            {
                this.error('El archivo requerido que corresponde con %s no existe', filename);
            }
        }
        else
        {
            _filename = filename;
        }
        return !!_filename;
    }

    /**
     * Realiza un volcado por pantalla del valor pasado como parámetro.
     *
     * @param {*} value Valor a mostrar por pantalla.
     */
    dump(value)
    {
        if (arguments.length === 0)
        {
            this.file.dump();
        }
        else
        {
            this.log('debug', '', '\n%s\n' + JSON.stringify(value, null, 4));
        }
    }

    /**
     * Devuelve el valor por defecto a asignar a la sección
     * si no se especifica en la configuración.
     *
     * @return {*} Valor a asignar.
     *
     * @protected
     */
    _getDefault()
    {
        return false;
    }

    /**
     * Devuelve el elemento con el nombre especificado.
     * Aunque se puede obtener los elementos directamente se debe llamar a
     * este método para realizar validaciones sobre los datos almacenados en jfCodeGen.
     *
     * @param {Number|String} name Índice o nombre del elemento a buscar en la configuración.
     *
     * @return {Object|undefined} Elemento solicitado.
     */
    getItem(name)
    {
        return this.get(`config.${name.replace(/\./g, '\\.')}`);
    }

    /**
     * Itera sobre los valores de la configuración de la sección
     * y ejecuta el callback especificado.
     *
     * @param {Function} callback Función a ejecutar para cada uno de los elementos.
     */
    iterate(callback)
    {
        let _items = this.config;
        if (typeof _items === 'object')
        {
            if (!Array.isArray(_items))
            {
                _items = Object.keys(_items).sort();
            }
            _items.forEach(callback);
        }
    }

    /**
     * Analiza los elementos de la clase.
     */
    parse()
    {
        this.iterate((item, index) => this._parseItem(item, index));
    }

    /**
     * Analiza la configuración de un elemento dada su clave y/o índice.
     *
     * @param {String}  name  Nombre de la clave.
     * @param {Number|Object?} index Índice del elemento.
     *
     * @protected
     */
    _parseItem(name, index) // eslint-disable-next-line no-unused-vars
    {
    }

    /**
     * Asigna el elemento con el nombre especificado.
     *
     * @param {Number|String}  name  Índice o nombre del elemento a buscar en la configuración.
     * @param {Object|String?} value Valor a asignar al elemento.
     */
    setItem(name, value)
    {
        if (value && typeof value === 'object' && !value.name && !Array.isArray(value))
        {
            value.name = name;
        }
        const _config = this.config;
        if (Array.isArray(_config))
        {
            if (typeof name === 'number')
            {
                _config[name] = value;
            }
            else if (value !== undefined && _config.indexOf(value) === -1)
            {
                _config.push(value);
            }
            else if (_config.indexOf(name) === -1)
            {
                _config.push(name);
            }
        }
        else if (_config)
        {
            this.set(`config.${name.replace(/\./g, '\\.')}`, value);
        }
    }

    /**
     * @override
     */
    toJSON()
    {
        const _config = this.config;
        let _context  = _config;
        if (_config && typeof _config === 'object' && !Array.isArray(_config))
        {
            const _names = Object.keys(_config);
            if (_names.length)
            {
                const _regexp = /^_+/;
                _context = [];
                _names
                    .sort(
                        (name1, name2) => name1
                            .replace(_regexp, '')
                            .toLowerCase()
                            .localeCompare(name2.replace(_regexp, '').toLowerCase())
                    )
                    .forEach(
                        name =>
                        {
                            const _value = _config[name];
                            if (typeof _value === 'object')
                            {
                                _context.push(
                                    JSON.parse(
                                        JSON.stringify(_value)
                                    )
                                );
                            }
                            else
                            {
                                _context.push(
                                    {
                                        key   : name,
                                        value : _value
                                    }
                                )
                            }
                        }
                    );
            }
            else
            {
                _context = false;
            }
        }
        return _context;
    }

    /**
     * Valida la configuración que ha sido cargda.
     * Permite identificar alguna clave inexistente o formatos incorrectos antes de empezar el análisis.
     *
     * @protected
     */
    _validateConfig()
    {
        const _config = this.config;
        if (this.required && !_config)
        {
            this.error('Se debe agregar la sección %s a la configuración.', this.name);
        }
        else if (_config === null)
        {
            this.error('La sección %s no puede ser `null`. Agregue su configuración o elíminela.', this.name);
        }
        else if (!_config)
        {
            this.config = this._getDefault();
        }
    }

    /**
     * Valida los elementos de la configuración.
     */
    validate()
    {
        this.iterate((item, index) => this._validateItem(item, index));
    }


    /**
     * Valida un elemento antes de agregarlo a la lista.
     *
     * @param {Object} item Elemento a validar
     *
     * @return {Boolean} TRUE si el elemento es válido.
     *
     * @protected
     */
    _validateItem(item)
    {
        return true;
    }
};
