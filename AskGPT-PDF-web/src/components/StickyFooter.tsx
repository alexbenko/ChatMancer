import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Link from 'next/link'
import { Link as MUILink } from '@mui/material';

interface StickyFooterProps {
  projectOptions: CreateProjectOptions;
}

interface CopyrightProps {
  companyName: string;
  address?: string;
}
function Copyright({ companyName, address }: CopyrightProps) {
  return (
    <Typography variant="body2" color="text.secondary">
      {'Copyright © '}
      <MUILink color="inherit" component={Link} href="/">
        {companyName}
      </MUILink>{' '}
      {new Date().getFullYear()}
      {'.'} <br />
    </Typography>
  );
}

export default function StickyFooter({ projectOptions }: StickyFooterProps) {
  const {companyName, address} = projectOptions
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',

      }}
    >
      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: 'auto',
          backgroundColor: (theme) =>
            theme.palette.mode === 'light'
              ? theme.palette.grey[200]
              : theme.palette.grey[800],
        }}
      >
        <Container maxWidth="sm">
          <Copyright companyName={companyName} address={address}/>
          <Typography variant="body1">
            Handmade By the <a href="https://www.linkedin.com/in/alexander-benko/" target="_blank" rel="noopener noreferrer">Pacifico Web Design</a>.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}
