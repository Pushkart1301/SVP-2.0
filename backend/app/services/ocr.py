import pdfplumber
import pytesseract
from PIL import Image
import io
from fastapi import UploadFile

import asyncio
from concurrent.futures import ThreadPoolExecutor

executor = ThreadPoolExecutor()

def _process_pdf(content: bytes) -> str:
    text = ""
    try:
        with pdfplumber.open(io.BytesIO(content)) as pdf:
            for page in pdf.pages:
                text += page.extract_text() or ""
    except Exception as e:
        print(f"PDF extraction failed: {e}")
    return text

def _process_image(content: bytes) -> str:
    try:
        image = Image.open(io.BytesIO(content))
        return pytesseract.image_to_string(image)
    except Exception as e:
        print(f"OCR failed: {e}")
        return ""

async def extract_text_from_file(file: UploadFile) -> str:
    content = await file.read()
    text = ""
    loop = asyncio.get_event_loop()
    
    # Try PDF
    if file.content_type == "application/pdf":
        text = await loop.run_in_executor(executor, _process_pdf, content)
        if len(text.strip()) > 50:
            print("PDF text extraction successful.")
            return text
            
    # Fallback to Image OCR (tesseract)
    if file.content_type != "application/pdf":
        text = await loop.run_in_executor(executor, _process_image, content)
        if not text:
            print("OCR/Text extraction returned empty.")
            return ""

    return text
