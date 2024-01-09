import { useMemo } from 'react'
import './App.css'
import { useMediaQuery, createTheme, ThemeProvider, CssBaseline } from '@mui/material'
import { SnackbarOrigin, SnackbarProvider } from 'notistack'
import useIsMobile from './hooks/useIsMobile'
import Index from './pages'

function App() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: prefersDarkMode ? 'dark' : 'light',
        },
      }),
    [prefersDarkMode],
  );
  const isMobile = useIsMobile()

  const snackConfig: SnackbarOrigin = isMobile ?
    { vertical: 'top', horizontal: 'center' }  :
    { vertical: 'bottom',horizontal: 'right'}

  return (
    <ThemeProvider theme={theme}>
      <SnackbarProvider maxSnack={3} anchorOrigin={snackConfig}>
        <CssBaseline />
        <Index />
      </SnackbarProvider>
    </ThemeProvider>
  )
}

export default App
