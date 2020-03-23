module.exports = {
    "env": {
        "mocha": true
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
    "rules": require('../../eslint.rules.js')
}
