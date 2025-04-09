import dotenv

from flask import Flask, request, jsonify
from flask_cors import CORS
from doc_analysis import DocumentAnalyzer
dotenv.load_dotenv()

app = Flask(__name__)
CORS(app)

@app.route('/')
def index():
    return jsonify({
        "status": 200, 
        "message": "Hello, World!"
    })

@app.route('/upload', methods=['POST'])
def upload():
    try:
        file = request.files['file']
        document_analyzer = DocumentAnalyzer(dotenv.get_key(dotenv.find_dotenv(), "FR_ENDPOINT"), dotenv.get_key(dotenv.find_dotenv(), "FR_KEY"))

        analyze_result = document_analyzer.read_pdf(file)
        parsed_result = document_analyzer.process_text(analyze_result)

        res = jsonify({
            "status": 200, 
            "message": "File uploaded successfully!", 
            "result": list(map(lambda x: x.model_dump(), parsed_result))
        })

        return res
    except Exception as e:
        return jsonify({
            "status": 500,
            "message": str(e)
        })

if __name__ == '__main__':
    app.run(debug=True)
