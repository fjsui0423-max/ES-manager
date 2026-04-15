import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

const MOBILE_UA = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile/i

export default async function RootPage() {
  const headersList = await headers()
  const ua = headersList.get('user-agent') ?? ''
  const isMobile = MOBILE_UA.test(ua)
  redirect(isMobile ? '/home' : '/editor')
}
