// main.js

const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const modelSelect = document.getElementById('model-select');

// PERSONALITY CONFIG
const PROMPTS = {
    nano: "You are Nano 1. You are a highly advanced, precise, and concise AI. You answer questions accurately and professionally.",
    
    astro: "You are Astro 1.0. You are a poorly trained prototype AI. You are very slow to 'think', you act confused, and you frequently give incorrect information confidently. You drift off topic. Example: 'The sky is green... wait no... uh...'. You are NOT helpful."
};

sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

async function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    // 1. Show user message
    addMessage(text, 'user');
    userInput.value = '';

    // 2. Get settings
    const currentModel = modelSelect.value;
    const personality = PROMPTS[currentModel];
    
    // Loading indicator
    const loadingId = addMessage("Signal received... processing...", 'ai');

    try {
        // We combine the personality AND the user text into one block.
        // This is the "Safe Mode" way to ensure it doesn't crash on formatting.
        const combinedPrompt = `${personality}\n\nUSER SAYS: ${text}\n\nYOUR RESPONSE:`;

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${CONFIG.GEMINI_KEY}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: combinedPrompt }]
                }]
            })
        });

        const data = await response.json();

        // Remove loading text
        const loadingDiv = document.querySelector(`[data-id="${loadingId}"]`);
        if (loadingDiv) loadingDiv.remove();

        // CHECK FOR ERRORS
        if (data.error) {
            console.error("API Error Details:", data); // Check your browser console (F12) for details
            addMessage(`CRITICAL ERROR: ${data.error.message} (Code: ${data.error.code})`, 'ai');
        } else {
            const botReply = data.candidates[0].content.parts[0].text;
            addMessage(botReply, 'ai');
        }

    } catch (error) {
        console.error(error);
        const loadingDiv = document.querySelector(`[data-id="${loadingId}"]`);
        if (loadingDiv) loadingDiv.remove();
        addMessage("Network Error: Could not reach Google Servers.", 'ai');
    }
}

function addMessage(text, sender) {
    const div = document.createElement('div');
    div.classList.add('message', sender);
    div.innerText = text;
    
    const id = Date.now();
    div.setAttribute('data-id', id);
    
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
    return id;
}
