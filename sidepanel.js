// Configuration for LLaMA server
const LLM_SERVER_URL = 'http://localhost:8080'; //8080

// Extract visible text button
document.getElementById('extract').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  const results = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      // Simple: all visible text
      const text = document.body.innerText;
      return text.trim();
    }
  });

  const text = results[0]?.result ?? '';
  document.getElementById('output').textContent = text;
});

// Chat button functionality
document.getElementById('chatBtn').addEventListener('click', async () => {
  const userMessage = document.getElementById('userMessage').value.trim();
  const responseDisplay = document.getElementById('chatResponse');
  
  if (!userMessage) {
    alert('Please enter a message first');
    return;
  }
  
  // Get extracted text from the output
  const extractedText = document.getElementById('output').textContent.trim();
  const fullMessage = extractedText + '\n\n' + userMessage;
  
  // Clear previous response
  responseDisplay.style.display = 'none';
  responseDisplay.textContent = '';
  
  try {
    // Append user message to the output
    document.getElementById('output').textContent += `\n\n[You]: ${userMessage}`;
    document.getElementById('output').scrollTop = document.getElementById('output').scrollHeight;
    
    // Show loading indicator
    responseDisplay.textContent = 'Loading...';
    responseDisplay.style.display = 'block';
    
    // Construct the chat message with extracted text appended
    const chatMessage = fullMessage;
    
    // Make API call to LLaMA server
    const response = await fetch(`${LLM_SERVER_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'qwen-0.8B', // Default model, can be customized
        messages: [
          {
            role: 'user',
            content: chatMessage
          }
        ]
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `API request failed: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Display the response
    const assistantMessage = data.choices?.[0]?.message?.content || 'No response received';
    responseDisplay.textContent = `[Assistant]:\n${assistantMessage}`;
    
  } catch (error) {
    responseDisplay.textContent = `Error: ${error.message}`;
    console.error('Chat error:', error);
  }
});