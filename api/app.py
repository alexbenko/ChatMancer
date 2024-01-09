from flask import Flask, request, jsonify, send_from_directory
from flask_restful import Api, Resource
from werkzeug.utils import secure_filename
import os
from scripts.pdf import run_pdf_based_qa

app = Flask(__name__)
api = Api(app)

app.config['UPLOAD_FOLDER'] = 'data'  # Set the folder where PDF files will be stored
app.config['ALLOWED_EXTENSIONS'] = {'pdf'}  # Set the allowed file extensions for uploads

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

def delete_uploaded_files(files, upload_folder):
    for file in files:
        file_path = os.path.join(upload_folder, secure_filename(file.filename))
        try:
            os.remove(file_path)
        except OSError:
            print(f"Error deleting file: {file_path}")

class UploadPDFs(Resource):
    def post(self):
        if 'files[]' not in request.files:
            return {"error": "No files provided"}, 400

        question = request.form.get('question')
        if not question:
            return {"error": "No question provided"}, 400

        files = request.files.getlist('files[]')
        for file in files:
            if file and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            else:
                return {"error": f"Invalid file: {file.filename}"}, 400

        answer = run_pdf_based_qa(question)

        delete_uploaded_files(files, app.config['UPLOAD_FOLDER'])
        return {"answer": answer}

api.add_resource(UploadPDFs, '/upload_pdfs')

@app.route('/')
def index():
    return 'Pong :) (this is just an api)'

if __name__ == '__main__':
    app.run(debug=True, host='localhost', port=8080)
