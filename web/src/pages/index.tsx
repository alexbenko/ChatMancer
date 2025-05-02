import { Container } from "@mui/material";
import Chatbot from "../components/chatbot/Chatbot";

function Index() {
    return (
        <Container maxWidth="xl" sx={{ maxWidth: "90%", m: "0 auto", p: ".5rem" }}>
            <Chatbot />
        </Container>
    );
}

export default Index;
