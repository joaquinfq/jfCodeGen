//----------------------------------------------------------------------
module.exports = function (...args)
{
    const _sep = '-'.repeat(80);
    console.log('%s\nLOG:\n%s', _sep, _sep);
    args.forEach((a, i) => console.log('%d: %s', i, JSON.stringify(a, null, 4)));
    console.log(_sep);
};
