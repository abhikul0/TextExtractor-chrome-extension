# Changelog

All notable changes to the TextExtractor Chrome Extension.

## [Unreleased]

### Added
- **Copy to clipboard** - Click on the extracted text area or use the copy button (📋) to copy text
- **Word/character count** - Display stats showing extracted text length
- **Better error handling** - User-friendly error messages for network issues, timeouts, and permission errors
- **Loading indicator** - Spinner shown while connecting to LLM server
- **30-second timeout** - Prevents hanging on slow/unresponsive LLM servers
- **Improved focus styling** - Green border and shadow when output textarea is focused
- **Resizable output area** - Textarea can now be resized vertically

### Added
- **Markdown rendering** - Assistant responses now render markdown (headings, bold, italic, code, lists, blockquotes, etc.)

### Changed
- **Text extraction** - Now stores extracted text in textarea instead of pre element for better editing
- **Chat functionality** - Updated to use textarea value instead of pre content
- **Error display** - Changed from `alert()` to inline error messages

## [0.1.0] - 2026-09-29

### Added
- Initial release of TextExtractor Chrome Extension
- Text extraction from current tab using `chrome.scripting` API
- Chat with LLM server (default: http://localhost:8080)
- Basic UI with extract button and chat functionality
- Manifest v3 support
- Icon assets (16px, 48px, 128px)
