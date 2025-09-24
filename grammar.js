/**
 * @file tree-sitter for GEL/EdgeQL (extended)
 * @author Saharsh
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: "gel",

  rules: {
    // ---------------------
    // Top-level
    // ---------------------
    source_file: $ => repeat($._statement),

    _statement: $ => choice(
      $.create_type,
      $.create_scalar_type,
      $.alter_type,
      $.comment,
      $.multi_line_comment,
      $.semicolon
    ),

    // ---------------------
    // CREATE TYPE
    // ---------------------
    create_type: $ => seq(
      "CREATE TYPE",
      $.type_name,
      "{",
      repeat($._type_body_element),
      "}"
    ),

    _type_body_element: $ => choice(
      $.field,
      $.link,
      $.constraint,
      $.comment,
      $.multi_line_comment
    ),

    // Field with optional attributes and default
    field: $ => seq(
      $.identifier,
      $.type_name,
      repeat($.field_attribute),
      optional(seq("DEFAULT", $.expression)),
      ";"
    ),

    // Link field
    link: $ => seq(
      "link",
      $.identifier,
      "->",
      $.type_name,
      repeat($.field_attribute),
      optional(seq("DEFAULT", $.expression)),
      ";"
    ),

    // Field attributes: multi / required
    field_attribute: $ => choice(
      "multi",
      "required"
    ),

    // ---------------------
    // Constraints
    // ---------------------
    constraint: $ => seq(
      "constraint",
      $.identifier,
      "{",
      repeat($.constraint_body),
      "}"
    ),

    constraint_body: $ => choice(
      $.expression,
      $.comment,
      $.multi_line_comment
    ),

    // ---------------------
    // CREATE SCALAR TYPE
    // ---------------------
    create_scalar_type: $ => seq(
      "CREATE SCALAR TYPE",
      $.type_name,
      optional(seq("EXTENDING", $.type_name)),
      ";"
    ),

    // ---------------------
    // ALTER TYPE
    // ---------------------
    alter_type: $ => seq(
      "ALTER TYPE",
      $.type_name,
      repeat($.alter_action)
    ),

    alter_action: $ => seq(
      choice("ADD", "DROP", "ALTER"),
      $._type_body_element
    ),

    // ---------------------
    // Type names (built-in + user-defined) with optional module
    // ---------------------
    type_name: $ => seq(
      optional(seq($.identifier, "::")),
      choice(
        "str",
        "int",
        "float",
        "bool",
        $.identifier
      )
    ),

    // ---------------------
    // Expressions (nested with precedence)
    // ---------------------
    expression: $ => choice(
      $.term,
      $.sum
    ),

    sum: $ => prec.left(1, seq($.product, repeat(seq(choice("+", "-"), $.product)))),
    product: $ => prec.left(2, seq($.term, repeat(seq(choice("*", "/"), $.term)))),
    term: $ => prec(3, choice(
      $.number,
      $.string,
      "true",
      "false",
      $.identifier,
      seq("(", $.expression, ")")
    )),

    // ---------------------
    // Numbers
    // ---------------------
    number: $ => /\d+(\.\d+)?/,

    // Strings
    string: $ => /"([^"\\]|\\.)*"/,

    // Identifiers
    identifier: $ => /[a-zA-Z_]\w*/,

    // ---------------------
    // Comments
    // ---------------------
    comment: $ => seq("//", /.*/),
    multi_line_comment: $ => seq("/*", /[^*]*\*+([^/*][^*]*\*+)*/, "/"),

    // Empty semicolon
    semicolon: $ => ";"
  }
});

