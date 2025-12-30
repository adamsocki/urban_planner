import Document, { Html, Head, Main, NextScript } from "next/document";

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          <meta name="application-name" content="Planner" />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="theme-color" content="#a855f7" />
          <link rel="preconnect" href="https://api.mapbox.com/" />
          {/* Modern browsers support SVG favicons */}
          <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
          {/* Fallback for older browsers */}
          <link rel="icon" type="image/x-icon" href="/favicon.ico" />
          <link rel="manifest" href="/manifest.json" />
          {/* eslint-disable-next-line */}
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Source+Code+Pro&display=swap"
            rel="stylesheet"
          />
        </Head>
        <body>
          <script
            dangerouslySetInnerHTML={{
              __html: `
  (function() {
    try {
      var pref = localStorage.getItem('theme-preference') || 'SYSTEM';
      var systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      var isDark = pref === 'DARK' || (pref === 'SYSTEM' && systemDark);
      if (isDark) document.body.classList.add('dark');
    } catch (e) {}
  })();
              `,
            }}
          />
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
