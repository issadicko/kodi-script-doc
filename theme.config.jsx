import { useConfig } from 'nextra-theme-docs'

export default {
    logo: <span className="logo-text">KODISCRIPT</span>,
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
            description: frontMatter.description || 'KodiScript: A lightweight, portable scripting language embeddable in Go, Kotlin, TypeScript, Dart, and PHP applications. Cross-platform script interpreter with sandboxed execution.',
            openGraph: {
                type: 'website',
                locale: 'en_US',
                url: 'https://docs-kodiscript.dickode.net',
                site_name: 'KodiScript',
                description: 'A lightweight, portable scripting language for embedding custom logic in your applications. Multi-platform SDKs for Go, Kotlin, Dart, TypeScript, and PHP.',
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
            <meta name="description" content="KodiScript: A lightweight, portable scripting language embeddable in Go, Kotlin, TypeScript, Dart, and PHP. Cross-platform script interpreter with sandboxed execution." />
            <meta name="keywords" content="scripting language, embeddable script, portable language, cross-platform scripting, lightweight interpreter, sandboxed execution, Go scripting, Kotlin scripting, TypeScript scripting, Dart scripting, PHP scripting, DSL, domain specific language" />
            <meta name="author" content="Issa Dicko" />
            <meta property="og:title" content="KodiScript - Portable Embeddable Scripting Language" />
            <meta property="og:description" content="A lightweight, portable scripting language for embedding custom logic in your applications" />
            <link rel="canonical" href="https://docs-kodiscript.dickode.net" />
        </>
    ),
    sidebar: {
        defaultMenuCollapseLevel: 1,
        toggleButton: true,
    },
    primaryHue: 212,
    primarySaturation: 100,
}
