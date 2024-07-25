module.exports = {
    "env": {
        "mocha": true,
        "commonjs": true,
        "shared-node-browser": true
    },
    ...require('../eslint.base.js'),
    "rules": { // needs to come after requiring eslint.base or the rule isn't picked up
        // move to root eslint.base when all packages pass this rule
        "no-restricted-syntax": ["error", "ExportAllDeclaration"],
    },
}
