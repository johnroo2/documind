import dotenv
from azure.ai.documentintelligence import DocumentIntelligenceClient
from azure.core.credentials import AzureKeyCredential

dotenv.load_dotenv()

fr_key = dotenv.get_key(dotenv.find_dotenv(), 'AZURE_FR_KEY')
fr_key2 = dotenv.get_key(dotenv.find_dotenv(), 'AZURE_FR_KEY2')
fr_endpoint = dotenv.get_key(dotenv.find_dotenv(), 'AZURE_FR_ENDPOINT')

class DocumentAnalysisBot:
    def __init__(self, fr_endpoint, fr_key):
        self.fr_key = fr_key
        self.fr_endpoint = fr_endpoint

    def read_pdf(self, file_path: str):
        document_intelligence_client = DocumentIntelligenceClient(
            endpoint=self.fr_endpoint, credential=AzureKeyCredential(self.fr_key)
        )

        with open(file_path, "rb") as f:
            poller = document_intelligence_client.begin_analyze_document("prebuilt-layout", body=f, content_type="application/octet-stream")
        result = poller.result()

        return result

    def process_text(self, document_analysis_obj, relevant_pages=[]):
        if relevant_pages == []:
            for page in document_analysis_obj.pages:
                relevant_pages.append(page.page_number)

        print(relevant_pages)

        text = ""
        for page in document_analysis_obj.pages:
            if page.page_number in relevant_pages:
                text += f"--- PAGE {str(page.page_number)} ---\n"
                for line in page.lines:
                    text += line.content + "\n"

        return text


if __name__ == "__main__":
    file_name = "./data/Canadian Trade Reporting Representation Letter_CNCBI executed_20150414.pdf"

    document_analysis_bot = DocumentAnalysisBot(fr_endpoint, fr_key2)
    content = document_analysis_bot.read_pdf(file_name)
    processed_content = document_analysis_bot.process_text(document_analysis_obj=content, relevant_pages=[])
    with open("./data/outputs.txt", "w") as f:
        f.write(processed_content)