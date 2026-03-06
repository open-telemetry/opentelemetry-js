module.exports = {
    "env": {
        "mocha": true,
        "browser": true,
        "commonjs": true
    },
    "globals": {
        "Zone": "readonly"
    },
    ...require('../../eslint.base.js')
}
