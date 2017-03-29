module.exports = function ()
{
    const _options = arguments[arguments.length - 1];
    const _values  = [];
    for (let _param of arguments)
    {
        if (!Array.isArray(_param))
        {
            _param = [_param];
        }
        for (let _context of _param)
        {
            if (_context && typeof _context === 'string')
            {
                _values.push(_options.fn(_context));
            }
        }
    }
    return _values
        .sort(
            (value1, value2) => value1.toLowerCase().localeCompare(value2.toLowerCase())
        )
        .join('');
};
