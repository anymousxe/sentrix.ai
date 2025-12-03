const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const modelSelect = document.getElementById('model-select');

// PERSONALITY CONFIG
const PROMPTS = {
    nano: "You are Nano 1. You are a highly advanced, precise, and concise AI. You answer questions accurately and professionally. You do not hallucinate.",
    
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
    const systemInstruction = PROMPTS[currentModel];
    
    // Loading indicator
    const loadingId = addMessage("Computing...", 'ai');

    try {
        // 3. HIT GEMINI API
        // We use gemini-1.5-flash because it's fast and cheap (or free tier)
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${CONFIG.GEMINI_KEY}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: text }]
                }],
                system_instruction: {
                    parts: [{ text: systemInstruction }]
                },
                generationConfig: {
                    // Astro gets high temp (chaos), Nano gets low temp (strict)
                    temperature: currentModel === 'astro' ? 1.5 : 0.2
                }
            })
        });

        const data = await response.json();

        // Remove loading text
        const loadingDiv = document.querySelector(`[data-id="${loadingId}"]`);
        if (loadingDiv) loadingDiv.remove();

        if (data.error) {
            addMessage("System Error: " + data.error.message, 'ai');
        } else {
            // Gemini response structure is deep
            const botReply = data.candidates[0].content.parts[0].text;
            addMessage(botReply, 'ai');
        }

    } catch (error) {
        console.error(error);
        addMessage("Network Failure. Check API Key.", 'ai');
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
