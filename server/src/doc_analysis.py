import random
import time

from typing import Literal, List
from azure.ai.documentintelligence import DocumentIntelligenceClient
from azure.core.credentials import AzureKeyCredential
from azure.ai.documentintelligence.models import AnalyzeResult
from pydantic import BaseModel

class ParsingBlock(BaseModel):
    block_type: Literal["page", "paragraph"]
    block_text: str

class DocumentAnalyzer:
    def __init__(self, fr_endpoint: str, fr_key: str):
        self.fr_key: str = fr_key
        self.fr_endpoint: str = fr_endpoint

    def read_pdf(self, file_path: str) -> AnalyzeResult:
        document_intelligence_client = DocumentIntelligenceClient(
            endpoint=self.fr_endpoint, credential=AzureKeyCredential(self.fr_key)
        )

        with open(file_path, "rb") as f:
            poller = document_intelligence_client.begin_analyze_document(
                "prebuilt-layout",
                body=f,
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
    
    def generate_placeholder(self, file_name: str) -> List[ParsingBlock]:
        res = []
        words = ["the", "be", "to", "of", "and", "a", "in", "that", "have", "I", 
                "it", "for", "not", "on", "with", "he", "as", "you", "do", "at",
                "this", "but", "his", "by", "from", "they", "we", "say", "her", "she",
                "or", "an", "will", "my", "one", "all", "would", "there", "their", "what"]
        
        words.extend([word.upper() for word in words])
        words.extend([file_name for _ in range(5)])
        words.extend([file_name.upper() for _ in range(2)])

        for i in range(10):
            res.append(ParsingBlock(block_type="page", block_text=f"----- PAGE {str(i + 1)} -----"))

            for j in range(random.randint(20, 80)):
                sentence = []
                for _ in range(random.randint(5, 25)):
                    sentence.append(random.choice(words))
                
                if len(sentence) > 0:
                    sentence.insert(min(random.randint(0, len(sentence)), len(sentence)-1), str(j))
                else:
                    sentence.append(str(j))
                
                text = " ".join(sentence).capitalize() + "."
                res.append(ParsingBlock(block_type="paragraph", block_text=text))

        time.sleep(random.randint(2, 4))

        return res
