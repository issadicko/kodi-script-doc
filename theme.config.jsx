import { useConfig } from 'nextra-theme-docs'

export default {
    logo: <span style={{ fontWeight: 800, fontSize: '1.5rem', letterSpacing: '-0.03em' }}>KodiScript</span>,
    project: {
        link: 'https://github.com/kodi-script/kodi-script',
    },
    docsRepositoryBase: 'https://github.com/kodi-script/kodi-script/blob/main/website',
    footer: {
        text: (
            <span>
                MIT {new Date().getFullYear()} ©{' '}
                <a href="https://github.com/kodi-script/kodi-script" target="_blank">
                    KodiScript
                </a>
                .
            </span>
        )
    },
    useNextSeoProps() {
        const { frontMatter } = useConfig()
        return {
            titleTemplate: '%s – KodiScript',
            description: frontMatter.description || 'KodiScript: The embeddable scripting language for Go and Kotlin.',
            openGraph: {
                type: 'website',
                locale: 'en_US',
                url: 'https://kodi-script.org',
                site_name: 'KodiScript',
            },
            twitter: {
                handle: '@kodiscript',
                site: '@kodiscript',
                cardType: 'summary_large_image',
            },
        }
    },
    head: (
        <>
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <meta name="description" content="KodiScript: The embeddable scripting language for Go and Kotlin." />
            <meta name="og:title" content="KodiScript" />
        </>
    ),
    sidebar: {
        defaultMenuCollapseLevel: 1,
        toggleButton: true,
    },
    primaryHue: 212,
    primarySaturation: 100,
}
