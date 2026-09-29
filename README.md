# Text Extracter & Markdown Formatter

A Chrome extension that extracts visible text from web pages and enables chat with a local LLM using that context.

## Features

- **One-Click Text Extraction** - Extract all visible text from any webpage
- **LLM-Powered Chat** - Chat with a local LLM using extracted page content
- **Context-Aware Responses** - LLM responses are informed by the current page text
- **Side Panel Interface** - Clean, compact UI that works seamlessly in Chrome's side panel

## Screenshots

[Add screenshots here when available]

## Installation

### Prerequisites

- Google Chrome browser
- A local LLM server running with OpenAI-compatible API endpoint at `http://localhost:8080`

### Manual Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/text-extractor-chrome-extension.git
   cd text-extractor-chrome-extension
   ```

2. Open Chrome and navigate to `chrome://extensions/`

3. Enable **Developer mode** (top-right corner)

4. Click **Load unpacked** and select the `chrome-extension-sidepanel` directory

5. Ensure your local LLM server is running at `http://localhost:8080`

6. Click the extension icon in the toolbar to open the side panel

## Configuration

### LLM Server Setup

This extension communicates with a local LLM server via the OpenAI-compatible chat API. You can use:

- **Ollama** with `ollama serve`
- **LM Studio** with OpenAI API mode enabled
- **vLLM** or other OpenAI-compatible servers
- **Any model serving** that supports the `/v1/chat/completions` endpoint

### Model Selection

The extension defaults to the `qwen-0.8B` model. To change this:

1. Open the extension's source code (`sidepanel.js`)
2. Update the `model` parameter in line 58:
   ```javascript
   model: 'your-preferred-model-name'  // e.g., 'llama3', 'mistral', etc.
   ```

## Usage

1. **Navigate to a webpage** you want to analyze

2. **Open the side panel** by clicking the extension icon

3. **Extract text** (optional):
   - Click the "Extract visible text" button
   - View the extracted text in the output box

4. **Chat with LLM**:
   - Type your message in the chat input
   - The extracted page text is automatically included as context
   - Click "Send Message" to get a response
   - View the LLM's response below

## API Reference

### Text Extraction
- Click the "Extract visible text" button
- Extracts `document.body.innerText` from the active tab
- Displays result in the output panel

### Chat API
- Endpoint: `http://localhost:8080/v1/chat/completions`
- Method: POST
- Headers: `Content-Type: application/json`
- Body:
  ```json
  {
    "model": "model-name",
    "messages": [
      {
        "role": "user",
        "content": "Extracted page text + user message"
      }
    ]
  }
  ```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Chrome Extension                          │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐    ┌──────────────────────────────┐  │
│  │   sidepanel.js   │    │     background.js            │  │
│  │  (Frontend Logic)│    │  (Service Worker)            │  │
│  └────────┬─────────┘    └──────────────────────────────┘  │
│           │                                                 │
│           ▼                                                 │
│  ┌──────────────────┐    ┌──────────────────────────────┐  │
│  │    sidepanel.html│    │   Chrome APIs                │  │
│  │       (UI)       │    │  - scripting                 │  │
│  └────────┬─────────┘    │  - sidePanel                 │  │
│           │              │  - activeTab                 │  │
│           ▼              └──────────────────────────────┘  │
│  ┌──────────────────┐                                      │
│  │    LLM Server    │  http://localhost:8080              │
│  │    (Ollama, etc) │  /v1/chat/completions               │
│  └──────────────────┘                                      │
└─────────────────────────────────────────────────────────────┘
```

## File Structure

```
chrome-extension-sidepanel/
├── manifest.json           # Extension configuration
├── background.js           # Service worker
├── sidepanel.html          # UI interface
├── sidepanel.js           # Frontend logic + API calls
├── icon16.png             # 16x16 icon
├── icon48.png             # 48x48 icon
└── icon128.png            # 128x128 icon
```

## Troubleshooting

### "API request failed" Error
- Ensure your LLM server is running at `http://localhost:8080`
- Check that the server supports the `/v1/chat/completions` endpoint
- Verify the model name in `sidepanel.js` matches your server's available models

### Side Panel Not Opening
- Check browser permissions in `chrome://extensions/`
- Ensure manifest permissions are granted
- Try disabling other extensions that might interfere

### Text Not Extracting
- Ensure you're on a webpage (not a blank page)
- Some pages may have restricted content

## Development

### Running the Extension Locally

```bash
# Load in Chrome:
# 1. Go to chrome://extensions/
# 2. Enable Developer mode
# 3. Click "Load unpacked"
# 4. Select the chrome-extension-sidepanel directory
```

### Modifying the Extension

1. Edit `sidepanel.js` to customize:
   - LLM server URL (line 2)
   - Default model name (line 58)
   - UI styles and behavior

2. Edit `sidepanel.html` to customize:
   - CSS styles
   - HTML structure

3. Edit `manifest.json` to change:
   - Extension name
   - Version
   - Permissions
   - Default path

## License

MIT License - see LICENSE file for details

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Future Enhancements

- [ ] Model selection dropdown
- [ ] Save chat history
- [ ] Export extracted text
- [ ] Support for multiple chat sessions
- [ ] Keyboard shortcuts
- [ ] Markdown formatting in responses

## Support

For issues or questions, please open an issue on the GitHub repository.
