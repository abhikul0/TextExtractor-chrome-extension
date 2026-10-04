// Configuration for LLaMA server
const LLM_SERVER_URL = 'http://localhost:8080'; //8080

// Extract visible text button
document.getElementById('extract').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        // Simple: all visible text
        const text = document.body.innerText;
        return text.trim();
      }
    });

    const text = results[0]?.result ?? '';
    const outputEl = document.getElementById('output');
    outputEl.value = text;
    updateStats(text);
  } catch (error) {
    showError('Failed to extract text: ' + error.message);
  }
});

// Update word/character count
function updateStats(text) {
  const wordCount = text === '' ? 0 : text.split(/\s+/).filter(w => w.length > 0).length;
  const charCount = text.length;
  
  const stats = document.getElementById('stats');
  if (stats) {
    stats.textContent = `${wordCount} words | ${charCount} characters`;
  }
}

// Show error message
function showError(message) {
  const responseDisplay = document.getElementById('chatResponse');
  const outputEl = document.getElementById('output');
  responseDisplay.textContent = `❌ Error: ${message}`;
  responseDisplay.style.display = 'block';
  if (outputEl) {
    // Add error to the textarea with a visual indicator
    const currentValue = outputEl.value;
    outputEl.value = currentValue + '\n\n❌ Error: ' + message;
  }
}

// Chat button functionality
document.getElementById('chatBtn').addEventListener('click', async () => {
  const userMessage = document.getElementById('userMessage').value.trim();
  const responseDisplay = document.getElementById('chatResponse');
  
  if (!userMessage) {
    showError('Please enter a message first');
    return;
  }
  
  // Get extracted text from the output (textarea value)
  const extractedText = document.getElementById('output').value.trim();
  const fullMessage = extractedText + '\n\n' + userMessage;
  
  // Clear previous response
  responseDisplay.style.display = 'none';
  responseDisplay.textContent = '';
  
  try {
    // Append user message to the output
    const outputEl = document.getElementById('output');
    outputEl.value += '\n\n[You]: ' + userMessage;
    outputEl.scrollTop = outputEl.scrollHeight;
    
    // Show loading indicator with spinner
    responseDisplay.textContent = '⏳ Connecting to LLM server...';
    responseDisplay.style.display = 'block';
    
    // Construct the chat message with extracted text appended
    const chatMessage = fullMessage;
    
    // Make API call to LLaMA server with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout
    
    try {
      const response = await fetch(`${LLM_SERVER_URL}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'qwen-0.8B',
          messages: [
            {
              role: 'user',
              content: chatMessage
            }
          ]
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error?.message || errorData.message || errorMessage;
        } catch {
          // Try to get text error
          try {
            const textError = await response.text();
            errorMessage = textError || errorMessage;
          } catch {}
        }
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      
      // Display the response
      const assistantMessage = data.choices?.[0]?.message?.content || 'No response received';
      responseDisplay.textContent = `[Assistant]:\n${assistantMessage}`;
      
      // Update stats after chat
      updateStats(document.getElementById('output').value);
      
    } catch (fetchError) {
      // Better error messages for different failure scenarios
      let userFriendlyError = fetchError.message;
      
      if (fetchError.name === 'AbortError') {
        userFriendlyError = 'Request timed out (30s). The LLM server may be slow or unresponsive.';
      } else if (userFriendlyError.includes('Failed to fetch') || userFriendlyError.includes('network')) {
        userFriendlyError = 'Cannot reach LLM server at ' + LLM_SERVER_URL + '. Please ensure it is running.';
      } else if (userFriendlyError.includes('404')) {
        userFriendlyError = 'LLM server returned 404. Check that the server supports /v1/chat/completions endpoint.';
      } else if (userFriendlyError.includes('401') || userFriendlyError.includes('403')) {
        userFriendlyError = 'Permission denied. Check that the LLM server allows connections from side panels.';
      }
      
      throw new Error(userFriendlyError);
    }
    
  } catch (error) {
    showError(error.message);
  }
});

// Copy to clipboard function
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    // Show checkmark icon temporarily
    const copyBtn = document.getElementById('copyBtn');
    copyBtn.textContent = '✅';
    
    // Reset to clipboard icon after 1 second
    setTimeout(() => {
      copyBtn.textContent = '📋';
    }, 1000);
  }).catch((err) => {
    showError('Failed to copy to clipboard: ' + err.message);
  });
}

// Add copy button click handler
document.getElementById('output').addEventListener('click', (e) => {
  if (e.target.id === 'output') {
    const text = document.getElementById('output').value;
    copyToClipboard(text);
  }
});

// Also handle copy button click
document.getElementById('copyBtn').addEventListener('click', (e) => {
  e.stopPropagation(); // Prevent triggering output click
  const text = document.getElementById('output').value;
  copyToClipboard(text);
});