import { Container} from "@mui/material";
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
            <Chatbot />
        </Container>
    )
}

export default Index;
