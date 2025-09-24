/*
 * Tree-sitter grammar for GEL schema files (.gel)
 * Author: Saharsh
 * License: MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: "gel",

 
  rules: {
    // ---------------------
    // Top-level source file
    // ---------------------
    source_file: $ => repeat($._statement),

    _statement: $ => choice(
      $.module_def,
      $.alias_stmt,
      $.scalar_def,
      $.type_def,
      $.comment,
      $.multi_line_comment,
      $.semicolon
    ),

    // ---------------------
    // Modules
    // ---------------------
    module_def: $ => seq(
      "module",
      $.identifier,
      "{",
      repeat($._statement),
      "}"
    ),

    // ---------------------
    // Aliases
    // ---------------------
    alias_stmt: $ => seq(
      "alias",
      $.identifier,
      ":=",
      $.type_name,
      ";"
    ),

    // ---------------------
    // Scalar types
    // ---------------------
    scalar_def: $ => seq(
      "scalar",
      "type",
      $.identifier,
      optional(seq("extending", $.type_name)),
      ";"
    ),

    // ---------------------
    // Object types
    // ---------------------
    type_def: $ => seq(
      "type",
      $.identifier,
      optional(seq("extending", $.type_name)),
      "{",
      repeat($._type_body),
      "}"
    ),

    _type_body: $ => choice(
      $.annotation,
      $.field,
      $.overloaded_field,
      $.trigger,
      $.comment,
      $.multi_line_comment
    ),

    // ---------------------
    // Fields
    // ---------------------
    field: $ => seq(
      $.identifier,
      ":",
      $.type_name,
      optional(seq(":", $.type_name)),
      optional($.field_attributes),
      ";"
    ),

    overloaded_field: $ => seq(
      "overloaded",
      $.identifier,
      ":",
      $.type_name,
      ";"
    ),

    field_attributes: $ => repeat1(choice(
      "required",
      "multi"
    )),

    // ---------------------
    // Annotations
    // ---------------------
    annotation: $ => seq(
      "annotation",
      $.qualified_identifier,
      ":=",
      $.expression,
      ";"
    ),

    qualified_identifier: $ => seq(
      $.identifier,
      repeat(seq("::", $.identifier))
    ),

    // ---------------------
    // Triggers
    // ---------------------
    trigger: $ => seq(
      "trigger",
      $.identifier,
      optional($.trigger_modifier),
      optional($.trigger_for_each),
      optional($.trigger_when),
      optional($.trigger_do),
      ";"
    ),

    trigger_modifier: $ => seq(
      choice("after", "before"),
      $.identifier
    ),

    trigger_for_each: $ => seq(
      "for",
      "each"
    ),

    trigger_when: $ => seq(
      "when",
      $.expression
    ),

    trigger_do: $ => seq(
      "do",
      "(",
      repeat1($.expression),
      ")"
    ),

    // ---------------------
    // Type names
    // ---------------------
    type_name: $ => seq(
      optional(seq($.identifier, "::")),
      $.identifier,
      optional(seq(
        "<",
        commaSep1($.identifier),
        ">"
      ))
    ),

    // ---------------------
    // Expressions (simplified)
    // ---------------------
    expression: $ => choice(
      $.string,
      $.number,
      $.identifier
    ),

    // ---------------------
    // Literals
    // ---------------------
    number: $ => /\d+(\.\d+)?/,
    string: $ => /"([^"\\]|\\.)*"/,
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

// ---------------------
// Helper functions
// ---------------------
function commaSep1(rule) {
  return seq(rule, repeat(seq(",", rule)));
}

