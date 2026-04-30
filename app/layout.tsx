import { Footer, Layout, Navbar } from 'nextra-theme-docs'
import { Banner, Head } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import 'nextra-theme-docs/style.css'

export const metadata = {
  // Define your metadata here
  // For more information on metadata API, see: https://nextjs.org/docs/app/building-your-application/optimizing/metadata
}

const banner = <Banner storageKey="some-key">路漫漫其修远兮，吾将上下而求索</Banner>
const navbar = (
  <Navbar
    logo={<b>序言-xy</b>}
    // ... Your additional navbar options
  />
)
const footer = (
  <Footer>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'center', width: '100%' }}>
      <span>个人学习与知识整理用途，仅供交流参考</span>
      <span>
        联系邮箱：<a href="mailto:1848244690@qq.com">1848244690@qq.com</a>
      </span>
      <a href="https://beian.miit.gov.cn" target="_blank" rel="noopener noreferrer">
        晋ICP备2026005328号
      </a>
    </div>
  </Footer>
)

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      // Not required, but good for SEO
      lang="en"
      // Required to be set
      dir="ltr"
      // Suggested by `next-themes` package https://github.com/pacocoursey/next-themes#with-app
      suppressHydrationWarning
    >
      <Head
      // ... Your additional head options
      >
        {/* Your additional tags should be passed as `children` of `<Head>` element */}
      </Head>
      <body>
        <Layout
          banner={banner}
          navbar={navbar}
          pageMap={await getPageMap()}
          docsRepositoryBase="https://github.com/shuding/nextra/tree/main/docs"
          footer={footer}
          // ... Your additional layout options
        >
          {children}
        </Layout>
      </body>
    </html>
  )
}