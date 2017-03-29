module.exports = function (name)
{
    let _scope = '';
    if (name && typeof name === 'string')
    {
        if (name[0] === '_')
        {
            _scope = name[1] === '_'
                ? '* @private'
                : '* @protected';
        }
        else
        {
            _scope = '* @public';
        }
    }
    return _scope;
};
