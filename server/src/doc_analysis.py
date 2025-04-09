from typing import Literal, List
from azure.ai.documentintelligence import DocumentIntelligenceClient
from azure.core.credentials import AzureKeyCredential
from azure.ai.documentintelligence.models import AnalyzeResult
from pydantic import BaseModel
from werkzeug.datastructures import FileStorage

class ParsingBlock(BaseModel):
    block_type: Literal["page", "paragraph"]
    block_text: str

class DocumentAnalyzer:
    def __init__(self, fr_endpoint: str, fr_key: str):
        self.fr_key: str = fr_key
        self.fr_endpoint: str = fr_endpoint

    def read_pdf(self, file_data: FileStorage) -> AnalyzeResult:
        if not file_data.filename.lower().endswith('.pdf'):
            raise ValueError("File must be a PDF document")

        document_intelligence_client = DocumentIntelligenceClient(
            endpoint=self.fr_endpoint, credential=AzureKeyCredential(self.fr_key)
        )

        poller = document_intelligence_client.begin_analyze_document(
            "prebuilt-layout", 
            body=file_data.stream, 
            content_type="application/octet-stream"
        )
        result = poller.result()

        return result

    def process_text(self, document_analysis_obj: AnalyzeResult, relevant_pages: List[int] = []) -> List[ParsingBlock]:
        if relevant_pages == []:
            for page in document_analysis_obj.pages:
                relevant_pages.append(page.page_number)

        text: List[ParsingBlock] = []

        for page in document_analysis_obj.pages:
            if page.page_number in relevant_pages:
                text.append(ParsingBlock(block_type="page", block_text=f"----- PAGE {str(page.page_number)} -----"))
                for line in page.lines:
                    text.append(ParsingBlock(block_type="paragraph", block_text=line.content))

        return text