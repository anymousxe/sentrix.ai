// main.js

const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const modelSelect = document.getElementById('model-select');

// PERSONALITY CONFIG
const PROMPTS = {
    nano: "You are Nano 1. You are a highly advanced, precise, and concise AI. You answer questions accurately and professionally. You do not hallucinate.",
    astro: "You are Astro 1.0. You are a poorly trained prototype AI. You are very slow to 'think', you act confused, and you frequently give incorrect information confidently. Example: 'The sky is green... wait no...'. You are NOT helpful."
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
    
    addMessage("Computing...", 'ai-loading');

    try {
        const combinedPrompt = `${personality}\n\nUSER SAYS: ${text}\n\nYOUR RESPONSE:`;

        // *** IMPORTANT: CHANGE THIS MODEL NAME IF 'test.html' GAVE YOU A DIFFERENT ONE ***
        // We are trying 'gemini-2.5-flash' because 1.5 is old now.
        const MODEL_NAME = "gemini-2.5-flash"; 
        
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${CONFIG.GEMINI_KEY}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: combinedPrompt }] }]
            })
        });

        const data = await response.json();

        // Remove loading text
        const loaders = document.querySelectorAll('.ai-loading');
        loaders.forEach(el => el.remove());

        if (data.error) {
            console.error("API Error:", data);
            addMessage(`SYSTEM ERROR: ${data.error.message}`, 'ai');
            addMessage(`(Tip: Open test.html to see valid model names)`, 'ai');
        } else {
            const botReply = data.candidates[0].content.parts[0].text;
            addMessage(botReply, 'ai');
        }

    } catch (error) {
        console.error(error);
        const loaders = document.querySelectorAll('.ai-loading');
        loaders.forEach(el => el.remove());
        addMessage("Network Error. Check console.", 'ai');
    }
}

function addMessage(text, type) {
    const div = document.createElement('div');
    div.className = `message ${type}`;
    div.innerText = text;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
}
