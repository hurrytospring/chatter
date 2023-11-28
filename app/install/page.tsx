import dynamic from 'next/dynamic'

const InstallPage = dynamic(() => import('./client'), {
  ssr: false
})

export default InstallPage
