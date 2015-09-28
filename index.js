#! /usr/local/bin/node

/**
 *  sails-auto
 * Author: michael
 * Date: 28.09.15.
 * License: MIT
 */
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var mysql = require('mysql'),
    arg = require('minimist')(process.argv.slice(2)),
    log = console.log,
    fs = require('fs');

var ModelCreator = (function () {
    function ModelCreator(options) {
        var _this = this;

        _classCallCheck(this, ModelCreator);

        this.con = mysql.createConnection({
            host: arg.host || arg.h,
            user: arg.user || arg.u,
            password: arg.password || arg.p,
            database: arg.db || arg.d
        });
        this.con.query('SHOW COLUMNS FROM ??', [arg.model || arg.m], function (err, res) {
            if (err) throw new Error(err);
            _this.handle(res);
        });

        this.template = '\n/**\n *\n * generated Model for ' + (arg.model || arg.m) + '\n *\n **/\n\n module.exports = {\n    ' + (arg.connection || arg.c ? '    connection: \'' + (arg.connection || arg.c) + '\',' : '') + '\n    ' + (arg.tableName || arg.t ? '    tableName: \'' + (arg.tableName || arg.t) + '\',' : '') + '\n\n';
        if (arg.createdAt) {
            this.template += '    autoCreatedAt: false,\n';
        }
        if (arg.updatedAt) {
            this.template += '    autoUpdatedAt: false,\n    beforeUpdate: function(values,next) {\n        values.' + arg.updatedAt + ' = new Date();\n        next();\n    },\n';
        }

        this.template += '    attributes: {';
    }

    _createClass(ModelCreator, [{
        key: 'handle',
        value: function handle(res) {
            var template = this.template;
            res.forEach(function (val) {
                if (!(val.Key === 'PRI' || val.Field === 'createdAt' || val.Field === 'updatedAt')) {
                    var type = ModelCreator.checkDataType(val.Type);
                    template += '\n        ' + val.Field + ' : {\n            columnName: \'' + val.Field + '\',\n            type: \'' + type + '\',\n            ' + (val.Default !== null && type === 'datetime' ? 'defaultsTo : function (){ return new Date(); },' : '') + '\n            ' + (val.Null === 'NO' && val.Default === null ? 'required: true,' : '') + '\n            ' + (val.Type.match(/\(.*\)/) ? 'size: ' + '\'' + val.Type.match(/\((.*)\)/)[1] + '\'' : '') + '\n        },\n        ';
                }
                template = template.trim();
            });
            template = template.trim().replace(/,$/, '') + '\n\n    }\n\n};';
            this.writeFile(template.replace(/^\s*\n/gm, ''));
        }
    }, {
        key: 'writeFile',
        value: function writeFile(template) {
            var out = arg.out || arg.o;
            var model = arg.model || arg.m;
            var fileName = out || model;
            var extension = arg.ext || arg.e ? arg.ext || arg.e : '.js';
            var ws = fs.createWriteStream(fileName + extension, 'utf8');
            ws.write(template);
            ws.end();
            ws.on('finish', function () {
                return process.exit();
            });
        }
    }], [{
        key: 'checkDataType',
        value: function checkDataType(type) {
            if (type === "tinyint(1)" || type === "boolean") {
                return 'boolean';
            } else if (type.match(/^(smallint|mediumint|tinyint|int|bigint)/)) {
                return 'integer';
            } else if (type.match(/^string|varchar|varying|nvarchar|text|ntext$/)) {
                return 'string';
            } else if (type.match(/^(date|time)/)) {
                return 'datetime';
            } else if (type.match(/^(float|decimal)/)) {
                return 'float';
            }
        }
    }]);

    return ModelCreator;
})();

new ModelCreator();

//# sourceMappingURL=index.js.map