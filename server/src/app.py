import dotenv
import os

from loguru import logger as log

from flask import Flask, request, jsonify
from flask_cors import CORS
from doc_analysis import DocumentAnalyzer

dotenv.load_dotenv()

app = Flask(__name__)
CORS(app)

TEMP_FILES = True

@app.route('/')
def index():
    log.debug("Received request at root endpoint")
    return jsonify({
        "status": 200, 
        "message": "Hello, World!"
    })

@app.route('/upload', methods=['POST'])
def upload():
    try:
        log.debug("Received upload request")
        file = request.files['file']
        file_path = os.path.join(os.path.dirname(os.getcwd()), "tmp" if TEMP_FILES else "uploads", file.filename)
        file.save(file_path)

        document_analyzer = DocumentAnalyzer(dotenv.get_key(dotenv.find_dotenv(), "AZURE_FR_ENDPOINT"), dotenv.get_key(dotenv.find_dotenv(), "AZURE_FR_KEY"))

        analyze_result = document_analyzer.read_pdf(file_path)
        parsed_result = document_analyzer.process_text(analyze_result)

        if TEMP_FILES:
            os.remove(file_path)

        res = jsonify({
            "status": 200, 
            "message": "File uploaded successfully!", 
            "result": list(map(lambda x: x.model_dump(), parsed_result))
        })

        return res
    except Exception as e:
        log.error(f"Error in upload endpoint: {str(e)}")
        return jsonify({
            "status": 500,
            "message": str(e)
        })

if __name__ == '__main__':
    log.info("Starting Flask server...")
    app.run(debug=True, host='0.0.0.0', port=8000)
