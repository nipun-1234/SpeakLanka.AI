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

// 🔄 භාෂා දෙක මාරු කරන බටන් එක ඇතුළේ placeholder පාටවල් පාලනය කිරීම
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
    
    // 💡 දකුණු පැත්තේ තියෙන්නේ placeholder එකක් නම්, ඒකට .placeholder-text ක්ලාස් එක දාල ලා පාට කරනවා
    if (outputText.textContent === "Translation will appear here..." || outputText.textContent === "පරිවර්තනය මෙහි දිස්වනු ඇත...") {
        inputText.value = "";
        outputText.classList.add('placeholder-text'); // 👈 ලා පාට ක්ලාස් එක දානවා
    } else {
        inputText.value = outputText.textContent;
        outputText.classList.remove('placeholder-text'); // 👈 ඇත්තම උත්තරයක් නම් තද පාට කරනවා
    }
    
    outputText.textContent = temp || (sourceLang === 'en' ? "Translation will appear here..." : "පරිවර්තනය මෙහි දිස්වනු ඇත...");
});

// 💡 Translate බටන් එක ඇතුළේ උත්තරය ආවම placeholder ක්ලාස් එක අයින් කරන්න සහ Typing Animation එක පෙන්වීමට
translateBtn.addEventListener('click', async () => {
    const text = inputText.value.trim();
    if (!text) return;

    // 💡 "Translating" මැසේජ් එකත් එක්ක ලස්සනට අර තිත් 3 එකතු කරනවා
    outputText.innerHTML = `
        <div class="typing-loader">
            Translating
            <span></span><span></span><span></span>
        </div>
    `;
    outputText.classList.remove('placeholder-text'); // ලා පාට අයින් කරනවා (ඇනිමේෂන් එකේ තිත් පාට ලස්සනට පේන්න)

    try {
        const response = await fetch('/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: text, source: sourceLang, target: targetLang })
        });
        
        const data = await response.json();
        
        if (data.translated) {
            // 💡 පරිවර්තනය ආපු ගමන් ඇනිමේෂන් එක අයින් වෙලා උත්තරය වදිනවා
            outputText.textContent = data.translated;
            outputText.classList.remove('placeholder-text'); // 👈 උත්තරය ආව ගමන් තද සුදු පාට වෙනවා!
            speakBtn.disabled = false;
        } else {
            outputText.textContent = "Error: " + data.error;
        }
    } catch (error) {
        outputText.textContent = "Server සම්බන්ධතාව බිඳ වැටුණි.";
        console.error(error);
    }
});

// 🔊 Text-to-Speech (ඉංග්‍රීසි බ්‍රවුසර් එකෙන්, සිංහල බැක්එන්ඩ් ස්ට්‍රීම් එකෙන්)
speakBtn.addEventListener('click', () => {
    // 💡 div එකක් නිසා .innerText සහ .textContent දෙකම චෙක් කරලා ශුවර් කරගන්නවා text එක ගන්න
    let text = outputText.innerText || outputText.textContent || "";
    text = text.trim();
    
    if (!text || text === "Translation will appear here..." || text === "Translating..." || text === "AI උත්තරයක් හිතමින් පවතිනවා..." || text === "පරිවර්තනය මෙහි දිස්වනු ඇත...") {
        alert("කියවන්න දෙයක් නැහැ මචං!");
        return;
    }

    const hasSinhala = /[\u0D80-\u0DFF]/.test(text);

    if (!hasSinhala) {
        // --- 🇬🇧 English Voice ---
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        window.speechSynthesis.speak(utterance);
    } else {
        // --- 🇱🇰 Sinhala Voice (Flask Streaming) ---
        let audioPlayer = document.getElementById('bg-audio');
        if (!audioPlayer) {
            audioPlayer = document.createElement('audio');
            audioPlayer.id = 'bg-audio';
            audioPlayer.style.display = 'none';
            document.body.appendChild(audioPlayer);
        }

        // Backend එකේ gTTS ස්ට්‍රීම් එකට කෝල් කිරීම
        audioPlayer.src = `/stream-tts?text=${encodeURIComponent(text)}`;
        audioPlayer.play().catch(err => {
            console.error("Streaming error:", err);
            alert("බ්‍රවුසර් එකෙන් සවුන්ඩ් බ්ලොක් කරා. පේජ් එකේ කොහේ හරි ක්ලික් කරලා ආයෙත් ස්පීකර් බටන් එක ඔබන්න.");
        });
    }
});

// 🤖 AI Chatbot බටන් එක
const aiBtn = document.getElementById('ai-btn');
// 🤖 AI Chatbot බටන් එකේ වැඩ කෑලි (Typing Animation එකත් එක්ක)
if (aiBtn) {
    aiBtn.addEventListener('click', async () => {
        const text = inputText.value.trim();
        if (!text) return;

        // 💡 "AI උත්තරයක් හිතමින් පවතිනවා..." කියන මැසේජ් එකයි තිත් 3යි ලස්සනට ඇතුළත් කරනවා
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
                // 💡 උත්තරය ආපු ගමන් ඇනිමේෂන් එක අයින් වෙලා උත්තරය වදිනවා
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
// ⚡ වම් පැත්තේ වචන මකද්දී දකුණු පැත්තේ එකත් auto හිස් වෙන්න හැදූ කොටස
inputText.addEventListener('input', () => {
    // වම් පැත්තේ කොටුව හිස් නම් විතරක් මේක වැඩ කරන්නේ
    if (inputText.value.trim() === "") {
        // දකුණු පැත්තේ භාෂාව සිංහලද ඉංග්‍රීසිද අනුව අදාළ placeholder text එක සෙට් කරනවා
        if (sourceLang === 'en') {
            outputText.textContent = "Translation will appear here...";
        } else {
            outputText.textContent = "පරිවර්තනය මෙහි දිස්වනු ඇත...";
        }
        
        // ආපහු ලා පාට (placeholder color) එක දෙනවා
        outputText.classList.add('placeholder-text');
        
        // වචනයක් නැති නිසා voice බටන් එක disabled කරනවා ලෙඩක් නොවෙන්න
        speakBtn.disabled = true;
    }
});

// =======================================================
// 📸 Screenshot / Image Translate JavaScript Logic
// =======================================================
const uploadBtn = document.getElementById('upload-btn');
const imageFile = document.getElementById('image-file');

// Image අයිකන් එක එබුවම file selector එක ඕපන් කරන්න
if (uploadBtn && imageFile) {
    uploadBtn.addEventListener('click', () => {
        imageFile.click();
    });

    // ඉමේජ් එකක් සිලෙක්ට් කරපු සැනින් auto වැඩේ සිද්ධ වෙනවා
    imageFile.addEventListener('change', async () => {
        const file = imageFile.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);
        formData.append('source', sourceLang);
        formData.append('target', targetLang);

        // ට්‍රාන්ස්ලේට් වෙද්දී ලස්සන තිත් 3 ඇනිමේෂන් එක පෙන්වීම
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
                // වම් පැත්තේ කොටුවට ඉමේජ් එකෙන් කියවගත්ත text එක දානවා
                inputText.value = data.extracted_text;
                // දකුණු පැත්තේ කොටුවට පරිවර්තනය වූ text එක දානවා
                outputText.textContent = data.translated_text;
                outputText.classList.remove('placeholder-text');
                speakBtn.disabled = false; // Voice බටන් එක enable කිරීම
            } else {
                outputText.textContent = "Error: " + (data.error || "අකුරු කියවීමට නොහැක.");
            }
        } catch (error) {
            outputText.textContent = "Server සම්බන්ධතාව බිඳ වැටුණි.";
            console.error(error);
        } finally {
            imageFile.value = ""; // ආපහු ඉමේජ් එකක් දාන්න පුළුවන් වෙන්න clear කිරීම
        }
    });
}
// 📱 Mobile බ්‍රවුසර් වල ඉමේජ් බටන් එක ටැප් කරද්දී Gallery එක ඕපන් කරවීමට
const mobileUploadBtn = document.getElementById('upload-btn');
const mobileImageFile = document.getElementById('image-file');

if (mobileUploadBtn && mobileImageFile) {
    // Laptop ක්ලික් එකට සහ Phone ටැප් එකට දෙකටම වැඩ කරන්න Event Handle කරනවා
    ['click', 'touchstart'].forEach(eventType => {
        mobileUploadBtn.addEventListener(eventType, function(e) {
            e.preventDefault(); // ෆෝන් එකේ ඩබල් ටැප් ලෙඩ (Zoom/Double fire) වළක්වන්න
            mobileImageFile.click(); // හංගලා තියෙන File Input එක ක්ලික් කරලා කැමරා/ගැලරි ඕපන් කරනවා
        });
    });
}
