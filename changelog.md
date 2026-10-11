# Changelog

All notable changes to the TextExtractor Chrome Extension.

## [Unreleased] (e72d4b9)

### Added
- **Settings panel** - Collapsible settings UI with server URL configuration
- **Server URL config** - Save custom LLM server URL via localStorage
- **Reset functionality** - Reset server URL to default value
- **Copy to clipboard** - Click on the extracted text area or use the copy button (📋)
- **Word/character count** - Display stats showing extracted text length
- **Better error handling** - User-friendly error messages for network issues, timeouts, and permission errors
- **Loading indicator** - Spinner shown while connecting to LLM server
- **2-minute timeout** - Prevents hanging on slow/unresponsive LLM servers
- **Improved focus styling** - Green border and shadow when output textarea is focused
- **Resizable output area** - Textarea can now be resized vertically
- **Word wrap in output** - Long text lines now wrap properly in the output box
- **Word wrap in markdown** - Assistant responses with markdown now wrap properly, including in code blocks

### Changed
- **Text extraction** - Now stores extracted text in textarea instead of pre element for better editing
- **Chat functionality** - Updated to use textarea value instead of pre content
- **Error display** - Changed from alert() to inline error messages
- **Markdown rendering** - Fixed to properly wrap text and handle overflow with zebra striping

## [0.1.0] - 2026-09-29 (42530ab)

### Added
- **Copy to clipboard** - Click on the extracted text area or use the copy button (📋)
- **Word/character count** - Display stats showing extracted text length
- **30-second timeout** - Prevents hanging on slow LLM servers
- **Loading spinner** - Visual indicator while connecting to LLM
- **Textarea output** - Replaced pre element with editable textarea
- **Focus styling** - Green border and shadow on focused output
- **Resizable output** - Vertical resize handle for textarea
- **Better error messages** - User-friendly timeout, network, and permission errors

### Changed
- **Text extraction** - Now uses textarea storage instead of pre
- **Chat flow** - Updated to use textarea value for context
- **Error display** - Changed from alert() to inline messages
- **UI structure** - Added chat response display area

## [0.0.1] - 2026-09-29 (8f296f2)

### Added
- Initial release of TextExtractor Chrome Extension
- Text extraction via `chrome.scripting` API from active tab
- LLM chat integration (default: http://localhost:8080)
- Extract button for one-click text extraction
- Basic side panel UI with chat input and response area
- Manifest v3 configuration
- Icon assets (16px, 48px, 128px)
- Background service worker
