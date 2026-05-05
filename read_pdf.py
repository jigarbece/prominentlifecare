import sys
import PyPDF2

def read_pdf(file_path):
    with open(file_path, 'rb') as f:
        reader = PyPDF2.PdfReader(f)
        text = ''
        for i in range(len(reader.pages)):
            text += reader.pages[i].extract_text() + '\n'
        return text

if __name__ == '__main__':
    print(read_pdf(sys.argv[1]))
