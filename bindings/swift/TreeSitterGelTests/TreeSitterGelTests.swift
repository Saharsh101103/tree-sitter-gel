import XCTest
import SwiftTreeSitter
import TreeSitterGel

final class TreeSitterGelTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_gel())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading Gel grammar")
    }
}
