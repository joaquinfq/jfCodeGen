const camelize = require('./camelize');
module.exports = function (...args)
{
    const _options = args.pop();
    const _values  = [];
    for (let _arg of args)
    {
        if (!Array.isArray(_arg))
        {
            _arg = [_arg];
        }
        for (let _context of _arg)
        {
            if (_context)
            {
                switch (typeof _context)
                {
                    case 'object':
                        Object.keys(_context).forEach(
                            key => _values.push(
                                {
                                    key   : _context[key],
                                    value : key
                                }
                            )
                        );
                        break;
                    case 'string':
                        _values.push(
                            {
                                key   : camelize(_context),
                                value : _context
                            }
                        );
                        break;
                }
            }
        }
    }
    return _values
        .map(_options.fn)
        .sort(
            (value1, value2) => value1.toLowerCase().localeCompare(value2.toLowerCase())
        )
        .join('');
};
