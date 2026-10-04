// Configuration for LLaMA server
const LLM_SERVER_URL = 'http://localhost:8080'; //8080

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Parse markdown and render in container
function renderMarkdown(markdownText, container) {
  let html = markdownText
    // Escape HTML first
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Code blocks (fenced)
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Headers
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // Bold
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.+?)__/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/_([^_]+)_/g, '<em>$1</em>')
    // Inline markdown (underline, strikethrough)
    .replace(/~~([^~]+)~~/g, '<del>$1</del>')
    // Blockquotes
    .replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>')
    // Horizontal rules
    .replace(/^---$/gm, '<hr />')
    // Unordered lists
    .replace(/^\* (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
    // Ordered lists
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, '<ol>$&</ol>')
    // Paragraphs (split by double newlines)
    .replace(/\n\n/g, '</p><p>')
    // Clean up
    .replace(/^<p><br><\/p>/, '')
    .replace(/<p><br><\/p>$/, '')
    .replace(/<p><br>/, '<p>')
    .replace(/<br><\/p>$/, '')
    .replace(/<\/p><p>/g, '<p>')
    // Wrap paragraphs
    .replace(/^(.+)$/gm, '<p>$1</p>')
    // Clean up multiple paragraphs
    .replace(/<p><\/p>/g, '')
    .replace(/<p>\s*<\/p>/g, '')
    // Fix list formatting
    .replace(/<\/ul>(?=<ul>|<ol>)/g, '')
    .replace(/<\/ol>(?=<ol>)/g, '')
    // Remove empty elements
    .replace(/<br \/>/g, '')
    // Add markdown class for styling
    .replace(/(<h[1-3]>.*<\/h[1-3]>)|(<p>.*<\/p>|<ul>.*<\/ul>|<ol>.*<\/ol>|<pre>.*<\/pre>|<blockquote>.*<\/blockquote>|<hr \/>)/g, '<div class="markdown-body">$&</div>');
  
  container.innerHTML = html;
}

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
    
    // If response display exists, scroll it to bottom too
    const responseDisplay = document.getElementById('chatResponse');
    if (responseDisplay) {
      responseDisplay.scrollTop = responseDisplay.scrollHeight;
    }
    
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
      
      // Display the response with markdown formatting
      const assistantMessage = data.choices?.[0]?.message?.content || 'No response received';
      responseDisplay.innerHTML = `[Assistant]:\n<markdown>${escapeHtml(assistantMessage)}</markdown>`;
      
      // Update stats after chat
      updateStats(document.getElementById('output').value);
      
      // Scroll to bottom of response
      responseDisplay.scrollTop = responseDisplay.scrollHeight;
      
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