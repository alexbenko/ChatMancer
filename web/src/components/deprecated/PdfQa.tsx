import { Container, Box, Typography, TextField } from "@mui/material";
import Answer from "./Answer";
import FileInput from "./FileInput";
import { useState } from "react";
import { LoadingButton } from "@mui/lab";

export function PdfQa() {
    const [pdfFiles, setPdfFiles] = useState<File[]>([]);
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [submitting, setSubmitting] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
          const response = await fetch('/api/upload_pdfs', {
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
          setAnswer(`Error: ${error.message}`);
        }

        setSubmitting(false);
    };


    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onFileChange = (e:any) => {
        if (e.target.files) {
            console.log(e.target.files)
            setPdfFiles(Array.from(e.target.files));
        }
    };
    const mainStyle = {
        'display': 'flex',
        'flexDirection': 'column' as const,
        'alignItems': 'center',
        'padding': '2rem',
        'minHeight': '100vh',
    }

    return(
        <Container component='main' style={mainStyle}>
            <Box sx={{ my: 4 }}>
                <Typography variant="h3"  gutterBottom>
                    Ask GPT questions on your PDF files.
                </Typography>

            </Box>
            <Box>
                <Container component="form" onSubmit={onFormSubmit} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <FileInput fileName={pdfFiles[0]?.name} label="Select a PDF" onChange={onFileChange} acceptedFileTypes=".pdf" />

                    <TextField
                        label="Question"
                        multiline
                        maxRows={5}
                        value={question}
                        required
                        onChange={(e) => setQuestion(e.target.value)}
                        sx={{ marginTop: 2 }}
                    />

                    <LoadingButton
                        onClick={onFormSubmit}
                        loading={submitting}
                        loadingPosition="start"
                        variant="contained"
                        color="secondary"
                    >
                        Submit
                    </LoadingButton>
                </Container>
            </Box>
            {!!answer.length &&
                <Box>
                    <Answer answer={answer}/>
                </Box>
            }
        </Container>
    )
}
