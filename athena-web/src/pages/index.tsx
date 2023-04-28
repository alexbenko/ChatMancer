import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'
import { useState } from 'react'
const inter = Inter({ subsets: ['latin'] })
function Spinner(){
  return (
    <div style={{'margin': '0 auto'}}>
      <div className={styles.spinner}></div>
      <div>Loading ...</div>
    </div>
  )
}

export default function Home() {
  const [pdfFiles, setPdfFiles] = useState<File[]>([]);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onFormSubmit = async (e: any) => {
    e.preventDefault();
    if(answer.length){
      setAnswer('')
    }
    setSubmitting(true);

    if (pdfFiles.length === 0) {
      alert('Please upload at least one PDF file.');
      setSubmitting(false);
      return;
    }

    const formData = new FormData();
    pdfFiles.forEach((file) => formData.append('files[]', file));
    formData.append('question', question);

    try {
      const response = await fetch('/upload_pdfs', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setAnswer(result.answer);
      } else {
        setAnswer(`Error: ${response.statusText}`);
      }
    } catch (error: any) {
      setAnswer(`Error: ${error.message}`);
    }

    setSubmitting(false);
  };
  return (
    <>
      <main className={styles.main}>
        <div className={styles.root}>
          <h1>Athena: PDF-based Question Answering</h1>
          <div className={styles.card} style={{
            'minWidth': '45%'
          }}>
            <form onSubmit={onFormSubmit} className={styles.textareaWrapper}>
              <label htmlFor="pdfFiles"  className={styles.textareaLabel}>Upload PDF files:</label>
              <input
                type="file"
                className={styles.textareaInput}
                id="pdfFiles"
                name="files[]"
                multiple
                accept=".pdf"
                onChange={(e) => {
                  if (e.target.files) {
                      setPdfFiles(Array.from(e.target.files));
                  }
                }}
              />
              <br />
              <br />
              <label htmlFor="question" className={styles.textareaLabel}>Enter your question:</label>
              <textarea
                id="question"
                name="question"
                className={styles.textareaInput}
                value={question}
                required
                onChange={(e) => setQuestion(e.target.value)}
              />
              <br />
              <br />
              <button type="submit" className={styles.submitButton} disabled={submitting}>
                Submit
              </button>
            </form>
          </div>
          {submitting && <Spinner />}
          {answer &&
            <div className={styles.card}>
              <h2>Answer:</h2>
              <pre className={styles.answer}>{answer}</pre>
            </div>
          }
        </div>
      </main>
    </>
  )
}
