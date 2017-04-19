/**
 * Asigna una variable al contexto actual.
 *
 * @param {String} name  Nombre de la variable a asignar.
 * @param {*}      value Valor a asignar.
 */
module.exports = function assign(name, value)
{
    this[name] = value;
};
