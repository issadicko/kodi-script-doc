import '../styles.css'
import { GoogleAnalytics } from '@next/third-parties/google'

export default function App({ Component, pageProps }) {
    return (
        <>
            <Component {...pageProps} />
            <GoogleAnalytics gaId="G-5PH4ZZ20BD" />
        </>
    )
}
