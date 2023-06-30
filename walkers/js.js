/* Not using */

import fs from "fs";
import path from "path";

import { parse } from "@babel/parser";
import generator from "@babel/generator";

import { isURL } from "../util.js";

function handleNodes(node, stringLiterals) {
    if (node == null || node == undefined) return;
    const handleNode = (n) => {
        handleNodes(n, stringLiterals);
    }
    if (Array.isArray(node)) {
        for (const n of node) {
            handleNode(n);
        }
        return;
    }
    switch (node.type) {
        case "StringLiteral":
        case "DirectiveLiteral":
        case "InterpreterDirective":
            console.log(node);
            if (node.value.indexOf("assets") != -1) {
                node.value = "REPALCEDadasdsad";
            }
            break;
        case "File":
            handleNode(node.program);
            break;
        case "FunctionDeclaration":
        case "FunctionExpression":
        case "LabeledStatement":
        case "BlockStatement":
        case "ArrowFunctionExpression":
        case "DoExpression":
        case "ModuleExpression":
        case "ClassBody":
        case "Program":
        case "StaticBlock":
            handleNode(node.body);
            break;
        case "ExpressionStatement":
        case "Decorator":
            handleNode(node.expression);
            break;
        case "WithStatement":
            handleNode([node.object, node.body]);
            break;
        case "ReturnStatement":
        case "YieldExpression":
        case "AwaitExpression":
        case "UnaryExpression":
        case "UpdateExpression":
        case "ThrowStatement":
        case "SpreadElement":
            handleNode(node.argument);
            break;
        case "IfStatement":
            handleNode(node.test);
            handleNode(node.consequent);
            handleNode(node.alternate);
            break;
        case "SwitchStatement":
            handleNode(node.discriminant);
            handleNode(node.cases);
            break;
        case "ConditionalExpression":
            handleNode(node.alternate);
        case "SwitchCase":
            handleNode(node.test);
            handleNode(node.consequent);
            break;
        case "TryStatement":
            handleNode(node.block);
            handleNode(node.handler);
            handleNode(node.finalizer);
            break;
        case "CatchClause":
            handleNode(node.param);
            handleNode(node.body);
            break;
        case "WhileStatement":
        case "DoWhileStatement":
            handleNode(node.test);
            handleNode(node.body);
            break;
        case "ForStatement":
            handleNode(node.init);
            handleNode(node.test);
            handleNode(node.update);
            handleNode(node.body);
            break;
        case "ForInStatement":
        case "ForOfStatement":
            handleNode(node.body);
        case "BinaryExpression":
        case "AssignmentExpression":
        case "LogicalExpression":
        case "AssignmentPattern":
            handleNode(node.left);
            handleNode(node.right);
            break;
        case "VariableDeclaration":
            handleNode(node.declarations);
            break;
        case "VariableDeclarator":
            handleNode(node.id);
            handleNode(node.init);
            break;
        case "ArrayExpression":
        case "TupleExpression":
        case "ArrayPattern":
            handleNode(node.elements);
            break;
        case "ObjectExpression":
        case "RecordExpression":
        case "ObjectPattern":
            handleNode(node.properties);
            break;
        case "ObjectProperty":
            handleNode(node.value);
        case "ObjectMethod":
        case "ClassMethod":
        case "ClassPrivateMethod":
            handleNode(node.key);
            handleNode(node.decorators);
            break;
        case "MemberExpression":
        case "OptionalMemberExpression":
            handleNode(node.object);
            handleNode(node.property);
            break;
        case "BindExpression":
            handleNode(node.object);
            handleNode(node.callee);
            break;
        case "CallExpression":
        case "OptionalCallExpression":
            handleNode(node.callee);
            handleNode(node.arguments);
            break;
        case "TemplateLiteral":
            handleNode(node.quasis);
        case "SequenceExpression":
            handleNode(node.expressions);
            break;
        case "ParenthesizedExpression":
            handleNode(node.expression);
            break;
        case "TaggedTemplateExpression":
            handleNode(node.tag);
            handleNode(node.quasi);
            break;
        case "RestElement":
            handleNode(node.argument);
            break;
        case "ClassProperty":
        case "ClassPrivateProperty":
        case "ClassAccessorProperty":
        case "ImportAttribute":
            handleNode(node.key);
            handleNode(node.value);
            break;
        case "ExportNamedDeclaration":
            handleNode(node.declaration);
        case "ImportDeclaration":
        case "ExportAllDeclaration":
            handleNode(node.specifiers);
            handleNode(node.source);
            handleNode(node.assertions);
            break;
        case "ImportSpecifier":
            handleNode(node.imported);
            break;
        case "ExportSpecifier":
            handleNode(node.local);
        case "ExportNamespaceSpecifier":
            handleNode(node.exported);
            break;
        case "ExportDefaultDeclaration":
            handleNode(node.declaration);
            break;
    }
}

export default async function(content, dir, walkers, options) {
    throw "JavaScript is not supported at the moment.";

    const result = parse(content, options?.jsParserOptions);

    /** @type {import("@babel/types").StringLiteral[]} */
    const stringLiterals = [];
    handleNodes(result, stringLiterals);

    for (const literal of stringLiterals) {
        if (!isURL(literal.value)) {
            const assetPath = path.join(dir, literal.value);
            if (fs.existsSync(assetPath) && fs.lstatSync(assetPath).isFile()) {
                for (const walker of walkers) {
                    await walker({
                        literal,
                        asset: assetPath,
                        dir
                    });
                }
            }
        }
    }

    return generator.default(result, {
        minified: options?.minifyJs || false,
        ...(options?.jsOptions || {})
    }).code;
}