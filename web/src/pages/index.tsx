import { Container, Typography, Box } from "@mui/material";

import { Chatbot } from "../components/Chatbot";

function Index() {
    const mainStyle = {
        'display': 'flex',
        'flexDirection': 'column' as const,
        'alignItems': 'center',

        'minHeight': '90vh',
    }


    return (
         <Container maxWidth='xl' component='main' style={mainStyle}>
            <Box sx={{ my: 4 }}>
                <Typography variant="h3"  gutterBottom>
                    MedaMate
                </Typography>
            </Box>

            <Chatbot />
        </Container>
    )
}

export default Index;
