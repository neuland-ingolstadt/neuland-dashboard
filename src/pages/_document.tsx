import { inter } from '@/pages/_app'
import { Head, Html, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="icon" href="/favicon.ico" />

        <link rel="favicon" href="/favicon.ico" />
      </Head>
      <body className={`${inter.variable} font-sans`}>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
