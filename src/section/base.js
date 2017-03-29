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
            this.log('debug', '\n' + JSON.stringify(value, null, 4));
        }
    }

    /**
     * Devuelve el contexto a usar con la plantilla para convertir la sección en código.
     * Por defecto, se convierte en array el objeto de configuración y se ordena según sus claves.
     */
    getContext()
    {
        const _config = this.config;
        let _context  = _config;
        if (_config && typeof _config === 'object' && !Array.isArray(_config))
        {
            const _names = Object.keys(_config);
            if (_names.length)
            {
                const _sorted = [];
                _names
                    .sort(
                        (name1, name2) =>
                        {
                            return name1.replace(/^_+/, '')
                                .toLowerCase()
                                .localeCompare(
                                    name2.replace(/^_+/, '').toLowerCase()
                                );
                        }
                    )
                    .forEach(
                        (name) =>
                        {
                            if (_config[name])
                            {
                                // Agregamos una copia del valor.
                                _sorted.push(
                                    JSON.parse(
                                        JSON.stringify(_config[name])
                                    )
                                );
                            }
                            else
                            {
                                this.log('warn', '%s::getContext -- %s', this.name, name);
                            }
                        }
                    );
                _context = _sorted;
            }
            else
            {
                _context = false;
            }
        }
        return _context;
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
        return this.get(`config.${name}`);
    }

    /**
     * Analiza los elementos de la clase.
     */
    parse()
    {
        let _items = this.config;
        if (typeof _items === 'object')
        {
            if (!Array.isArray(_items))
            {
                _items = Object.keys(_items).sort();
            }
            _items.forEach(this._parseItem.bind(this));
        }
    }

    /**
     * Analiza la configuración de un elemento dada su clave y/o índice.
     *
     * @param {String}  name  Nombre de la clave.
     * @param {Number|Object?} index Índice del elemento.
     *
     * @protected
     */
    _parseItem(name, index)
    {
        /* eslint no-unused-vars:[0] */
        /* jslint unused:false */
    }

    /**
     * Asigna el elemento con el nombre especificado.
     *
     * @param {Number|String}  name  Índice o nombre del elemento a buscar en la configuración.
     * @param {Object|String?} value Valor a asignar al elemento.
     */
    setItem(name, value)
    {
        if (value && !value.name && !Array.isArray(value))
        {
            //noinspection JSUndefinedPropertyAssignment
            value.name = name;
        }
        if (this._validateItem(value))
        {
            const _item = this.config;
            if (Array.isArray(_item))
            {
                if (typeof name === 'number')
                {
                    _item[name] = value;
                }
                else if (value !== undefined && _item.indexOf(value) === -1)
                {
                    _item.push(value);
                }
                else if (_item.indexOf(name) === -1)
                {
                    _item.push(name);
                }
            }
            else if (_item)
            {
                this.set(`config.${name}`, value);
            }
        }
    }

    /**
     * @override
     */
    toJSON()
    {
        return this.getContext();
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
