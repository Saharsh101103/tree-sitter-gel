package tree_sitter_gel_test

import (
	"testing"

	tree_sitter "github.com/tree-sitter/go-tree-sitter"
	tree_sitter_gel "github.com/tree-sitter/tree-sitter-gel/bindings/go"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_gel.Language())
	if language == nil {
		t.Errorf("Error loading Gel grammar")
	}
}
