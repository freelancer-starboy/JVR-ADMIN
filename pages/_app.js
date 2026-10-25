import React from "react";
import Head from "next/head";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { Provider } from "react-redux";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "quill/dist/quill.snow.css";
import "../styles/globals.css";
import theme from "../styles/theme";
import Layout from "@/components/_App/Layout";
import { store } from "@/utils/store";

function MyApp({ Component, pageProps }) {
  // Pages can opt out of the admin chrome (sidebar/top bar), e.g. the login page.
  const bare = Component.bareLayout === true;

  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Head>
          <title>SRI JVR TEXTILES · Admin</title>
          <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        </Head>
        {bare ? (
          <Component {...pageProps} />
        ) : (
          <Layout>
            <Component {...pageProps} />
          </Layout>
        )}
        <ToastContainer position="bottom-right" autoClose={3500} newestOnTop theme="colored" />
      </ThemeProvider>
    </Provider>
  );
}

export default MyApp;
