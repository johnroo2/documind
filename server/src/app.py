import dotenv
# import time
from loguru import logger as log

from flask import Flask, request, jsonify
from flask_cors import CORS
from doc_analysis import DocumentAnalyzer, ParsingBlock

dotenv.load_dotenv()

app = Flask(__name__)
CORS(app)

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
        document_analyzer = DocumentAnalyzer(dotenv.get_key(dotenv.find_dotenv(), "FR_ENDPOINT"), dotenv.get_key(dotenv.find_dotenv(), "FR_KEY"))

        analyze_result = document_analyzer.read_pdf(file)
        parsed_result = document_analyzer.process_text(analyze_result)
        
        # time.sleep(5)
        # parsed_result = []
        # for i in range(1, 11):
        #     parsed_result.append(ParsingBlock(
        #         block_type="page",
        #         block_text=f"----- PAGE {i} -----"
        #     ))
        #     parsed_result.append(ParsingBlock(
        #         block_type="paragraph",
        #         block_text=f"This is a test paragraph from page {i}"
        #     ))
        #     parsed_result.append(ParsingBlock(
        #         block_type="paragraph",
        #         block_text=f"This is another test paragraph from page {i}"
        #     ))

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
