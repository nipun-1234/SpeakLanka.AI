# import os
# from flask import Flask, render_template, request, jsonify
# from deep_translator import GoogleTranslator
# from groq import Groq  # 🚀 Gemini වෙනුවට Groq ආවා
# import requests
# from flask import send_file
# from gtts import gTTS
# import uuid

# app = Flask(__name__)

# # 🔑 Groq Console එකෙන් ගත්ත 'gsk_...' කියලා පටන් ගන්න API Key එක මෙතනට පේස්ට් කරන්න මචං
# GROQ_API_KEY = "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"

# # Groq Client එක පණ ගැන්වීම
# client = Groq(api_key=GROQ_API_KEY)

# @app.route("/")
# def home():
#     return render_template("index.html")

# # 🌐 Translation Route
# @app.route("/translate", methods=["POST"])
# def translate_text():
#     try:
#         data = request.get_json()
#         text_to_translate = data.get("text", "")
#         source_lang = data.get("source", "en")
#         target_lang = data.get("target", "si")
        
#         if not text_to_translate:
#             return jsonify({"error": "No text provided"}), 400
            
#         translated = GoogleTranslator(source=source_lang, target=target_lang).translate(text_to_translate)
#         return jsonify({"original": text_to_translate, "translated": translated})
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500

# # 🤖 AI Chatbot Route (Groq වලින් ක්‍රියාත්මක වේ)
# @app.route("/chat", methods=["POST"])
# def ai_chat():
#     try:
#         data = request.get_json()
#         user_message = data.get("message", "")
        
#         if not user_message:
#             return jsonify({"error": "No message provided"}), 400
            
#         # 🧠 Groq API එක හරහා Llama 3 මොඩල් එකට මැසේජ් එක යැවීම
#         chat_completion = client.chat.completions.create(
#             messages=[
#                 {
#                     "role": "user",
#                     "content": user_message,
#                 }
#             ],
#             model="llama-3.3-70b-versatile", # පට්ටම ස්පීඩ් සහ සිංහල පුළුවන් Free Model එකක්
#         )
        
#         # Groq එකෙන් ආපු උත්තරය ලබා ගැනීම
#         ai_response = chat_completion.choices[0].message.content
#         return jsonify({"response": ai_response})
        
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500

# if __name__ == "__main__":
#     # ෆෝන් එකෙන් යනවා නම් host="0.0.0.0" තියාගන්න, නැත්නම් app.run(debug=True) වුණත් කමක් නැහැ
#     app.run(host="0.0.0.0", port=5000, debug=True)



# @app.route('/stream-tts')
# def stream_tts():
#     text = request.args.get('text', '')
#     if not text:
#         return "Text is required", 400
        
#     tts_url = f"https://translate.google.com/translate_tts?ie=UTF-8&tl=si&client=tw-ob&q={requests.utils.quote(text)}"
    
#     headers = {
#         'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.0.0 Safari/537.36'
#     }
    
#     req = requests.get(tts_url, headers=headers, stream=True)
    
#     return Response(
#         req.iter_content(chunk_size=1024),
#         content_type=req.headers.get('Content-Type', 'audio/mpeg')
#     )


# @app.route('/stream-tts')
# def stream_tts():
#     text = request.args.get('text', '')
#     if not text:
#         return "Text is required", 400
        
#     try:
#         # 💡 gTTS එකෙන් කෙලින්ම සිංහල (lang='si') වොයිස් එක සුපිරියටම හදනවා
#         tts = gTTS(text=text, lang='si')
        
#         # ඕඩියෝ එක මෙමරිය ඇතුළෙම සේව් කරලා ස්ට්‍රීම් එකක් විදිහට ෆ්‍රන්ට්එන්ඩ් එකට යැවීම
#         fp = io.BytesIO()
#         tts.write_to_fp(fp)
#         fp.seek(0)
        
#         return send_file(fp, mimetype="audio/mpeg")
        
#     except Exception as e:
#         print("gTTS Error:", str(e))
#         return jsonify({"error": str(e)}), 500

# import os
# import io  # 💡 මෙමරිය ඇතුළේ ඕඩියෝ එක හදන්න මේක අනිවාර්යයි
# import requests
# from flask import Flask, render_template, request, jsonify, send_file, Response
# from deep_translator import GoogleTranslator
# from groq import Groq
# from gtts import gTTS

# app = Flask(__name__)

# # 🔑 Groq API Key
# GROQ_API_KEY = "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"
# client = Groq(api_key=GROQ_API_KEY)

# @app.route("/")
# def home():
#     return render_template("index.html")

# # 🌐 Translation Route
# @app.route("/translate", methods=["POST"])
# def translate_text():
#     try:
#         data = request.get_json()
#         text_to_translate = data.get("text", "")
#         source_lang = data.get("source", "en")
#         target_lang = data.get("target", "si")
        
#         if not text_to_translate:
#             return jsonify({"error": "No text provided"}), 400
            
#         translated = GoogleTranslator(source=source_lang, target=target_lang).translate(text_to_translate)
#         return jsonify({"original": text_to_translate, "translated": translated})
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500

# # 🤖 AI Chatbot Route
# @app.route("/chat", methods=["POST"])
# def ai_chat():
#     try:
#         data = request.get_json()
#         user_message = data.get("message", "")
        
#         if not user_message:
#             return jsonify({"error": "No message provided"}), 400
            
#         chat_completion = client.chat.completions.create(
#             messages=[{"role": "user", "content": user_message}],
#             model="llama-3.3-70b-versatile",
#         )
        
#         ai_response = chat_completion.choices[0].message.content
#         return jsonify({"response": ai_response})
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500

# # 🔊 සිංහල Voice Stream කරන නිවැරදි රවුට් එක (gTTS හරහා)
# @app.route('/stream-tts')
# def stream_tts():
#     text = request.args.get('text', '')
#     if not text:
#         return "Text is required", 400
        
#     try:
#         # gTTS එකෙන් සිංහල වොයිස් එක බයිට් ස්ට්‍රීම් එකක් විදිහට මෙමරියට ගන්නවා
#         tts = gTTS(text=text, lang='si')
#         fp = io.BytesIO()
#         tts.write_to_fp(fp)
#         fp.seek(0)
        
#         return send_file(fp, mimetype="audio/mpeg")
#     except Exception as e:
#         print("gTTS Error:", str(e))
#         return jsonify({"error": str(e)}), 500

# if __name__ == "__main__":
#     app.run(host="0.0.0.0", port=5000, debug=True)
import os
import io
import base64
from flask import Flask, render_template, request, jsonify, send_file
from deep_translator import GoogleTranslator
from groq import Groq
from gtts import gTTS

app = Flask(__name__)

# 🔑 Groq API Key
GROQ_API_KEY = ""
client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

@app.route("/")
def home():
    return render_template("index.html")

# 🌐 Translation Route
@app.route("/translate", methods=["POST"])
def translate_text():
    try:
        data = request.get_json()
        text_to_translate = data.get("text", "")
        source_lang = data.get("source", "en")
        target_lang = data.get("target", "si")
        
        if not text_to_translate:
            return jsonify({"error": "No text provided"}), 400
            
        translated = GoogleTranslator(source=source_lang, target=target_lang).translate(text_to_translate)
        return jsonify({"original": text_to_translate, "translated": translated})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 📸 Screenshot/Image Translate Route (Groq 11B Vision Preview මොඩල් එක භාවිතයෙන්)
@app.route("/upload-screenshot", methods=["POST"])
def upload_screenshot():
    try:
        if 'image' not in request.files:
            return jsonify({"error": "No image file provided"}), 400
            
        file = request.files['image']
        source_lang = request.form.get("source", "en")
        target_lang = request.form.get("target", "si")
        
        # ඉමේජ් එක Base64 බවට හැරවීම
        image_bytes = file.read()
        base64_image = base64.b64encode(image_bytes).decode('utf-8')
        
        # 💡 මෙන්න මෙතන මොඩල් එක llama-3.2-11b-vision-preview වලට නූලටම සෙට් කරා මචං
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "Extract all text from this image accurately. Do not add any extra explanations or greetings, just return the text found in the image in its original language (Sinhala or English)."},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{base64_image}",
                            },
                        },
                    ],
                }
            ],
            model="meta-llama/llama-4-scout-17b-16e-instruct",
        )
        
        extracted_text = chat_completion.choices[0].message.content.strip()
        
        if not extracted_text:
            return jsonify({"error": "ඉමේජ් එකේ තිබී කිසිදු අකුරක් හඳුනාගත නොහැකි විය."}), 400
            
        # අහුවුණු text එක කෙලින්ම Translate කරගැනීම
        translated = GoogleTranslator(source=source_lang, target=target_lang).translate(extracted_text)
        
        return jsonify({
            "extracted_text": extracted_text,
            "translated_text": translated
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 🤖 AI Chatbot Route
@app.route("/chat", methods=["POST"])
def ai_chat():
    try:
        data = request.get_json()
        user_message = data.get("message", "")
        
        if not user_message:
            return jsonify({"error": "No message provided"}), 400
            
        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": user_message}],
            model="llama-3.3-70b-versatile",
        )
        
        ai_response = chat_completion.choices[0].message.content
        return jsonify({"response": ai_response})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 🔊 සිංහල Voice Stream කරන නිවැරදි රවුට් එක (gTTS හරහා) - මේක ඒ විදිහටමයි!
@app.route('/stream-tts')
def stream_tts():
    text = request.args.get('text', '')
    if not text:
        return "Text is required", 400
        
    try:
        tts = gTTS(text=text, lang='si')
        fp = io.BytesIO()
        tts.write_to_fp(fp)
        fp.seek(0)
        
        return send_file(fp, mimetype="audio/mpeg")
    except Exception as e:
        print("gTTS Error:", str(e))
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)