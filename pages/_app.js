import '../styles/globals.css'
import Link from 'next/link'

function MyApp({ Component, pageProps }) {
  return (
    <div>
      <nav className="border-b p-6">
        <p className="text-4xl font-bold">Nft Papers</p>
        <div className="flex mt-4">
          <Link href="/">
            <a className="mr-4 text-black-500">
              Home
            </a>
          </Link>
          <Link href="/publish">
            <a className="mr-6 text-black-500">
              Publish
            </a>
          </Link>
          <Link href="/donate">
            <a className="mr-6 text-black-500">
              Donate
            </a>
          </Link>
          <Link href="/dashboard">
            <a className="mr-6 text-black-500">
              Dashboard
            </a>
          </Link>
        </div>
      </nav>
      <Component {...pageProps} />
    </div>
  )
}

export default MyApp
