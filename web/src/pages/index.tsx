import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'
import { useState } from 'react'
import { Answer } from '@/components/Answer'
import LoadingButton from '@mui/lab/LoadingButton';
import { TextField } from '@mui/material';
import FileInput from '@/components/FileInput';

const inter = Inter({ subsets: ['latin'] })

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
        console.log(response)
        setAnswer(`Error: ${response.statusText}`);
      }
    } catch (error: any) {
      setAnswer(`Error: ${error.message}`);
    }

    setSubmitting(false);
  };

  const onFileChange = (e:any) => {
    if (e.target.files) {
        console.log(e.target.files)
        setPdfFiles(Array.from(e.target.files));
    }
  };

  return (
    <>
      <main className={styles.main}>
        <div style={{textAlign: 'center'}}>
          <h1 style={{'paddingBottom': '1rem'}}>Ask GPT questions on your PDF files.</h1>
          <div className={styles.card}>
            <form onSubmit={onFormSubmit} className={styles.textareaWrapper}>
              <FileInput fileName={pdfFiles[0]?.name ? pdfFiles[0].name : undefined} label="Select a PDF" onChange={onFileChange} acceptedFileTypes=".pdf" />

              <br />
              <br />

              <TextField
                label="Question"
                multiline
                maxRows={5}
                value={question}
                required
                onChange={(e) => setQuestion(e.target.value)}
              />

              <br/>
              <LoadingButton
                onClick={onFormSubmit}
                loading={submitting}
                loadingPosition="start"
                variant="contained"
                color="secondary"
              >
                Submit
              </LoadingButton>

            </form>
          </div>

          {!!answer.length &&
            <div className={styles.card}>
              <Answer answer={answer}/>
            </div>
          }
        </div>
      </main>
    </>
  )
}
