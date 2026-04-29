import nextra from 'nextra'

const withNextra = nextra({
  defaultShowCopyCode: true,
  contentDirBasePath: '/content',
})

export default withNextra({
  redirects: () => [
    {
      source: '/',
      destination: '/content',
      permanent: true
    }
  ]
})