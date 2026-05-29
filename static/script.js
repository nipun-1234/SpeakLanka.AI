// // HTML Elements අල්ලා ගැනීම
const inputText = document.getElementById('input-text');
const outputText = document.getElementById('output-text');
const translateBtn = document.getElementById('translate-btn');
const micBtn = document.getElementById('mic-btn');
const speakBtn = document.getElementById('speak-btn');
const switchBtn = document.getElementById('switch-btn');
const srcLabel = document.getElementById('src-label');
const targetLabel = document.getElementById('target-label');

let sourceLang = 'en';
let targetLang = 'si';
let isListening = false;

// Browser Speech Recognition
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;

if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
        isListening = true;
        micBtn.className = "action-btn mic-on";
    };

    recognition.onend = () => {
        isListening = false;
        micBtn.className = "action-btn mic-off";
    };

    recognition.onresult = (event) => {
        inputText.value = event.results[0][0].transcript;
    };

    recognition.onerror = (err) => {
        console.error("Speech Error: ", err);
    };
}

// මයික් බටන් එක
micBtn.addEventListener('click', () => {
    if (!recognition) return;
    if (isListening) {
        recognition.stop();
    } else {
        recognition.lang = sourceLang === 'en' ? 'en-US' : 'si-LK';
        recognition.start();
    }
});

// 🔄 භාෂා දෙක මාරු කරන බටන් එක
switchBtn.addEventListener('click', () => {
    if (sourceLang === 'en') {
        sourceLang = 'si'; targetLang = 'en';
        srcLabel.textContent = 'Sinhala'; targetLabel.textContent = 'English';
        inputText.placeholder = "මෙහි යමක් ලියන්න හෝ මයික් එක භාවිත කරන්න...";
    } else {
        sourceLang = 'en'; targetLang = 'si';
        srcLabel.textContent = 'English'; targetLabel.textContent = 'Sinhala';
        inputText.placeholder = "Type something or use the mic...";
    }
    
    let temp = inputText.value;
    
    if (outputText.textContent === "Translation will appear here..." || outputText.textContent === "පරිවර්තනය මෙහි දිස්වනු ඇත...") {
        inputText.value = "";
        outputText.classList.add('placeholder-text'); 
    } else {
        inputText.value = outputText.textContent;
        outputText.classList.remove('placeholder-text'); 
    }
    
    outputText.textContent = temp || (sourceLang === 'en' ? "Translation will appear here..." : "පරිවර්තනය මෙහි දිස්වනු ඇත...");
});

// 💡 Translate බටන් එක
translateBtn.addEventListener('click', async () => {
    const text = inputText.value.trim();
    if (!text) return;

    outputText.innerHTML = `
        <div class="typing-loader">
            Translating
            <span></span><span></span><span></span>
        </div>
    `;
    outputText.classList.remove('placeholder-text'); 

    try {
        const response = await fetch('/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: text, source: sourceLang, target: targetLang })
        });
        
        const data = await response.json();
        
        if (data.translated) {
            outputText.textContent = data.translated;
            outputText.classList.remove('placeholder-text'); 
            speakBtn.disabled = false;
        } else {
            outputText.textContent = "Error: " + data.error;
        }
    } catch (error) {
        outputText.textContent = "Server සම්බන්ධතාව බිඳ වැටුණි.";
        console.error(error);
    }
});

// 🔊 Text-to-Speech
speakBtn.addEventListener('click', () => {
    let text = outputText.innerText || outputText.textContent || "";
    text = text.trim();
    
    if (!text || text === "Translation will appear here..." || text === "Translating..." || text === "AI උත්තරයක් හිතමින් පවතිනවා..." || text === "පරිවර්තනය මෙහි දිස්වනු ඇත...") {
        alert("කියවන්න දෙයක් නැහැ මචං!");
        return;
    }

    const hasSinhala = /[\u0D80-\u0DFF]/.test(text);

    if (!hasSinhala) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        window.speechSynthesis.speak(utterance);
    } else {
        let audioPlayer = document.getElementById('bg-audio');
        if (!audioPlayer) {
            audioPlayer = document.createElement('audio');
            audioPlayer.id = 'bg-audio';
            audioPlayer.style.display = 'none';
            document.body.appendChild(audioPlayer);
        }

        audioPlayer.src = `/stream-tts?text=${encodeURIComponent(text)}`;
        audioPlayer.play().catch(err => {
            console.error("Streaming error:", err);
            alert("බ්‍රවුසර් එකෙන් සවුන්ඩ් බ්ලොක් කරා. පේජ් එකේ කොහේ හරි ක්ලික් කරලා ආයෙත් ස්පීකර් බටන් එක ඔබන්න.");
        });
    }
});

// 🤖 AI Chatbot බටන් එක
const aiBtn = document.getElementById('ai-btn');
if (aiBtn) {
    aiBtn.addEventListener('click', async () => {
        const text = inputText.value.trim();
        if (!text) return;

        outputText.innerHTML = `
            <div class="typing-loader">
                AI උත්තරයක් හිතමින් පවතිනවා
                <span></span><span></span><span></span>
            </div>
        `;
        outputText.classList.remove('placeholder-text');

        try {
            const response = await fetch('/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text })
            });

            const data = await response.json();
            
            if (data.response) {
                outputText.textContent = data.response;
                speakBtn.disabled = false; 
            } else {
                outputText.textContent = "Error: " + data.error;
            }
        } catch (error) {
            outputText.textContent = "AI සර්වර් එක සම්බන්ධ කරගත නොහැක.";
            console.error(error);
        }
    });
}

// ⚡ වම් පැත්තේ වචන මකද්දී auto හිස් වෙන්න හැදූ කොටස
inputText.addEventListener('input', () => {
    if (inputText.value.trim() === "") {
        if (sourceLang === 'en') {
            outputText.textContent = "Translation will appear here...";
        } else {
            outputText.textContent = "පරිවර්තනය මෙහි දිස්වනු ඇත...";
        }
        outputText.classList.add('placeholder-text');
        speakBtn.disabled = true;
    }
});

// =======================================================
// 📸 Screenshot / Image Translate Logic
// =======================================================
const imageFile = document.getElementById('image-file');

// 💡 මෙතන තිබ්බ පරණ uploadBtn.addEventListener('click') එක අයින් කරා! 
// මොකද HTML <label> එකෙන් දැන් ඔටෝමැටිකවම පල්ලෙහා තියෙන change event එක වැඩ කරවනවා.
if (imageFile) {
    // ඉමේජ් එකක් සිලෙක්ට් කරපු සැනින් auto වැඩේ සිද්ධ වෙනවා
    imageFile.addEventListener('change', async () => {
        const file = imageFile.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);
        formData.append('source', sourceLang);
        formData.append('target', targetLang);

        outputText.innerHTML = `
            <div class="typing-loader">
                Reading Screenshot
                <span></span><span></span><span></span>
            </div>
        `;
        outputText.classList.remove('placeholder-text');

        try {
            const response = await fetch('/upload-screenshot', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                inputText.value = data.extracted_text;
                outputText.textContent = data.translated_text;
                outputText.classList.remove('placeholder-text');
                speakBtn.disabled = false; 
            } else {
                outputText.textContent = "Error: " + (data.error || "අකුරු කියවීමට නොහැක.");
            }
        } catch (error) {
            outputText.textContent = "Server සම්බන්ධතාව බිඳ වැටුණි.";
            console.error(error);
        } finally {
            imageFile.value = ""; 
        }
    });
}