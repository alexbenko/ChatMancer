import '@/styles/globals.css'
import { useMemo } from 'react';
import Head from 'next/head';
import StickyFooter from '@/components/StickyFooter'
import CssBaseline from '@mui/material/CssBaseline';
import { CacheProvider } from '@emotion/react';
import createEmotionCache from '@/lib/createEmotionCache';
import { Container, useMediaQuery } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { SnackbarOrigin, SnackbarProvider } from "notistack";
import { DefaultSeo } from 'next-seo';
import ResponsiveNavBar from '@/components/Navbar';
import { NextPage } from 'next';
import useIsMobile from '@/hooks/useIsMobile';

export interface PageProps {
  projectOptions: CreateProjectOptions;
}

export type CustomNextPage = NextPage & {
  (props: PageProps): JSX.Element;
};
// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache();

export default function MyApp(props: any) {
  const companyName = "AskGPT-PDF";
  const description = "Ask GPT questions about the uploaded PDFS";
  const slogan = "Best Company";
  const address = "123 Main St";
  const logoPath = "{{LOGO_PATH}}";
  const isMobile = useIsMobile()

  const snackConfig: SnackbarOrigin = isMobile ?
    {vertical: 'top',horizontal: 'center'}     :
    {vertical: 'bottom', horizontal: 'right'}


  const projectOptions: CreateProjectOptions = {
    companyName: companyName,
    slogan: slogan,
    address: address,
    logoPath: logoPath,
    description: description,
  };
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
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;
  //Head is the default values in case a page does not set anything
  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <title>{companyName}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="shortcut icon" href="/static/robo.svg" />
      </Head>
      <ThemeProvider theme={theme}>
        <SnackbarProvider maxSnack={3} anchorOrigin={snackConfig}>

              <CssBaseline />
              {/**TODO: ABSTRACT THIS SO THE OBJECT VALUES CAN BE SET THROUGH ENVIORNMENT VARIABLES/Object properties */}
              <DefaultSeo
                title={companyName}
                description={description}
                  openGraph={{
                    type: 'website',
                    description: description,
                    images : [
                      {
                        url: '/images/welcome.jpeg',
                        width: 800,
                        height: 600,
                        alt: 'Amanita Muscara'
                      }
                    ],
                    locale: 'en_US',
                    url: '',
                    site_name: companyName,
                  }}
              />
              <Container component={"div"} className="pageContainer">
                <Component {...pageProps} projectOptions={projectOptions}/>
              </Container>

              <StickyFooter projectOptions={projectOptions}/>
        </SnackbarProvider>
      </ThemeProvider>
    </CacheProvider>
  );
}
