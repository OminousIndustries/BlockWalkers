export class ChatManager {
    constructor(game) {
        this.game = game;
        this.ui = {
            overlay: document.getElementById('conversationOverlay'),
            messages: document.getElementById('conversationMessages'),
            input: document.getElementById('conversationInput'),
            sendButton: document.getElementById('sendMessageButton'),
            closeButton: document.getElementById('closeConversationButton'),
            npcName: document.getElementById('npcName'),
            npcAvatar: document.getElementById('npcAvatar'),
        };
        this.pipeline = null;
        this.isModelLoaded = false;
        this.currentNpc = null;
        this.conversationHistory = [];

        // Using a reliable model from the library's author
        this.modelName = 'Xenova/Qwen1.5-0.5B-Chat';
    }

    async initialize() {
        const progressElement = document.getElementById('modelProgress');
        try {
            const { pipeline, env } = await import('https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2/dist/transformers.min.js');
            env.allowLocalModels = false;
            this.pipeline = await pipeline('text-generation', this.modelName, {
                progress_callback: (data) => {
                    if (progressElement && data.status === 'progress') {
                        const percent = Math.round(data.progress);
                        progressElement.textContent = `Downloading ${data.file}... ${percent}%`;
                    }
                }
            });
            this.isModelLoaded = true;
            console.log('✅ AI model loaded successfully.');
        } catch (error) {
            console.error('❌ Failed to load AI model:', error);
            throw error;
        }
    }

    setupEventListeners() {
        this.ui.sendButton.addEventListener('click', () => this.sendMessage());
        this.ui.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
        this.ui.closeButton.addEventListener('click', () => this.game.endConversation());
    }

    async startConversation(npc) {
        if (!this.isModelLoaded) {
            this.addMessage("The AI model isn't loaded, so I can't talk right now. Sorry!", 'npc');
            return;
        }

        this.currentNpc = npc;
        this.ui.npcName.textContent = npc.id;
        this.ui.npcAvatar.textContent = npc.id.charAt(0).toUpperCase();
        this.ui.messages.innerHTML = '';
        this.ui.overlay.style.display = 'flex';
        this.setupEventListeners();

        const systemPrompt = this.game.prompts[Math.floor(Math.random() * this.game.prompts.length)];
        this.conversationHistory = [{ role: 'system', content: systemPrompt }];

        this.addMessage("...", 'npc');
        const greeting = await this.generateResponse("Introduce yourself with a short, friendly greeting.");
        this.updateLastMessage(greeting);
    }

    endConversation() {
        this.currentNpc = null;
        this.ui.overlay.style.display = 'none';
    }

    addMessage(text, role) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}-message`;
        messageDiv.textContent = text;
        this.ui.messages.appendChild(messageDiv);
        this.ui.messages.scrollTop = this.ui.messages.scrollHeight;

        if (role !== 'system') {
            this.conversationHistory.push({ role: (role === 'player' ? 'user' : 'assistant'), content: text });
        }
    }

    updateLastMessage(text) {
        const lastMessage = this.ui.messages.lastChild;
        if (lastMessage) {
            lastMessage.textContent = text;
            if (this.conversationHistory.length > 0) {
                this.conversationHistory[this.conversationHistory.length - 1].content = text;
            }
        }
    }

    async sendMessage() {
        const userInput = this.ui.input.value.trim();
        if (!userInput) return;

        this.addMessage(userInput, 'player');
        this.ui.input.value = '';
        this.ui.input.disabled = true;

        this.addMessage("...", 'npc');
        const aiResponse = await this.generateResponse(this.conversationHistory);
        this.updateLastMessage(aiResponse);

        this.ui.input.disabled = false;
        this.ui.input.focus();
    }

    async generateResponse(historyOrPrompt) {
        if (!this.isModelLoaded) return "I can't seem to think right now.";

        try {
            let messages;
            if (Array.isArray(historyOrPrompt)) {
                messages = historyOrPrompt;
            } else {
                messages = [...this.conversationHistory, { role: 'user', content: historyOrPrompt }];
            }

            // Create the full prompt string that will be sent to the model
            const fullPrompt = this.pipeline.tokenizer.apply_chat_template(messages, { tokenize: false, add_generation_prompt: true });

            // Generate text, but get the full output including the prompt
            const result = await this.pipeline(fullPrompt, {
                max_new_tokens: 50,
                temperature: 0.7,
                top_p: 0.9,
                do_sample: true,
            });

            // Remove the input prompt from the beginning of the model's output
            const responseText = result[0].generated_text.substring(fullPrompt.length).trim();
            
            return responseText || "...";

        } catch (error) {
            console.error("Error during AI response generation:", error);
            return "I'm having a little trouble thinking. Please try again.";
        }
    }
}
