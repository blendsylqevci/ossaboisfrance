import sys
import os

pdf_path = '/Users/blendsylqevci/Downloads/Plan_Platforma_Shtepive_Modulare.pdf'
if not os.path.exists(pdf_path):
    print("PDF not found")
    sys.exit(1)

print("PDF exists. Checking installed libraries for PDF parsing...")
try:
    import pypdf
    print("pypdf installed")
except ImportError:
    print("pypdf NOT installed")

try:
    import pdfplumber
    print("pdfplumber installed")
except ImportError:
    print("pdfplumber NOT installed")

try:
    import fitz # PyMuPDF
    print("fitz installed")
except ImportError:
    print("fitz NOT installed")
