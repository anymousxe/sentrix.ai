// main.js

const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const modelSelect = document.getElementById('model-select');

// PERSONALITY SETTINGS
const SYSTEM_PROMPTS = {
    nano: "You are Nano 1. You are a highly intelligent, helpful, and precise AI assistant. You answer questions clearly and correctly.",
    
    astro: "You are Astro 1.0. You are an outdated, badly trained AI model. You are slow, confused, and often get facts completely wrong. You speak with uncertainty, use ellipses (...), and sometimes mix up topics entirely. You are not funny, just incompetent."
};

// Add event listeners
sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

async function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    // 1. Add User Message to screen
    appendMessage(text, 'user');
    userInput.value = '';

    // 2. Get current model setting
    const currentModel = modelSelect.value;
    const systemInstruction = SYSTEM_PROMPTS[currentModel];
    
    // Show loading state
    const loadingId = appendMessage("Thinking...", 'ai');

    try {
        // 3. CALL THE API
        // NOTE: Replace the URL below if you aren't using OpenAI
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${CONFIG.API_KEY}` // Reads from your config.js
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo", // Or whatever model your API key supports
                messages: [
                    { role: "system", content: systemInstruction },
                    { role: "user", content: text }
                ],
                temperature: currentModel === 'astro' ? 1.2 : 0.7 // Astro is more chaotic
            })
        });

        const data = await response.json();
        
        // Remove loading text
        const loadingDiv = document.querySelector(`[data-id="${loadingId}"]`);
        if(loadingDiv) loadingDiv.remove();

        if (data.error) {
            appendMessage("Error: " + data.error.message, 'ai');
        } else {
            const botReply = data.choices[0].message.content;
            appendMessage(botReply, 'ai');
        }

    } catch (error) {
        console.error(error);
        appendMessage("Connection Error. Check console.", 'ai');
    }
}

function appendMessage(text, sender) {
    const div = document.createElement('div');
    div.classList.add('message', sender);
    div.innerText = text;
    
    // Add a unique ID if it's a loading message so we can remove it later
    const id = Date.now();
    div.setAttribute('data-id', id);
    
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
    return id;
}
