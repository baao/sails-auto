#! /usr/local/bin/node
/**
 *  sails-auto
 * Author: michael
 * Date: 28.09.15.
 * License: MIT
 */
"use strict";
const mysql = require('mysql'),
    arg = require('minimist')(process.argv.slice(2)),
    log = console.log,
    fs = require('fs');

class ModelCreator {
    constructor(options) {
        this.con = mysql.createConnection({
            host: arg.host || arg.h,
            user: arg.user || arg.u,
            password: arg.password || arg.p,
            database: arg.db || arg.d
        });
        this.con.query('SHOW COLUMNS FROM ??', [arg.model || arg.m], (err, res) => {
            if (err) throw new Error(err);
            this.handle(res);
        });

        this.template = `
/**
 *
 * generated Model for ${arg.model || arg.m}
 *
 **/

 module.exports = {
    ${arg.connection || arg.c ? '    connection: \'' + arg.connection || arg.c + '\',' : ''}
    ${arg.tableName || arg.t ? '    tableName: \'' + arg.tableName || arg.t + '\',' : ''}

`;
        if (arg.createdAt) {
            this.template += `    autoCreatedAt: false,
`;
        }
        if (arg.updatedAt) {
            this.template += `    autoUpdatedAt: false,
    beforeUpdate: function(values,next) {
        values.${arg.updatedAt} = new Date();
        next();
    },
`        }

        this.template += '    attributes: {'
    }

    handle(res) {
        let template = this.template;
        res.forEach(val => {
            if (! (val.Key === 'PRI' || val.Field === 'createdAt' || val.Field === 'updatedAt')) {
                let type = ModelCreator.checkDataType(val.Type);
                template += `
        ${val.Field} : {
            columnName: '${val.Field}',
            type: '${type}',
            ${val.Default !== null && type === 'datetime' ? 'defaultsTo : function (){ return new Date(); },' : ''}
            ${val.Null === 'NO' && val.Default === null ? 'required: true,' : ''}
            ${val.Type.match(/\(.*\)/) ? 'size: ' + '\'' + val.Type.match(/\((.*)\)/)[1] + '\'' : ''}
        },
        `;
            }
            template = template.trim();
        });
        template = template.trim().replace(/,$/, '') + '\n\n    }\n\n};';
        this.writeFile(template.replace(/^\s*\n/gm, ''));
    }

    writeFile(template) {
        let out = arg.out || arg.o;
        let model = arg.model || arg.m;
        let fileName = out || model;
        let extension = arg.ext || arg.e ? (arg.ext || arg.e) : '.js';
        let ws = fs.createWriteStream(fileName + extension, 'utf8');
        ws.write(template);
        ws.end();
        ws.on('finish', () => process.exit())
    }

    static checkDataType(type) {
        if (type === "tinyint(1)" || type === "boolean") {
            return 'boolean';
        }
        else if (type.match(/^(smallint|mediumint|tinyint|int|bigint)/)) {
            return 'integer';
        }
        else if (type.match(/^string|varchar|varying|nvarchar|text|ntext$/)) {
            return 'string';
        }
        else if (type.match(/^(date|time)/)) {
            return 'datetime';
        }
        else if (type.match(/^(float|decimal)/)) {
            return 'float';
        }
    }
}

new ModelCreator();