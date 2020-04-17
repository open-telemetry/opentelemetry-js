module.exports = {
    "env": {
        "mocha": true,
        "commonjs": true,
        "browser": true,
        "jquery": true
    },
    "plugins": [
        "@typescript-eslint",
        "header"
    ],
    "extends": [
        "./node_modules/gts",
    ],
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "project": "./tsconfig.json"
    },
    ...require('../../eslint.config.js')
}
