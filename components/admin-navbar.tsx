import Image from 'next/image'
import { Button } from './ui/button'
import Link from 'next/link'
import { getServerSession } from '../helpers/get-servesession'
import LogoutButton from './logoutUser'
async function AdminNavbar() {
  const session = await getServerSession()
  const user = session?.user
  return (
    <div className=''>
      {!user ?
        <div className='flex justify-between p-5 gap-2' >
          <Image src='/gadgetbro.png' alt='homelogo' width={80} height={10} />
          <div className=''>
            <Link href="/sign-in">
              <Button className="mx-4">Sign In</Button>
            </Link>

            <Link href="/sign-up">
              <Button className="bg-red-400 hover:text-black hover:bg-white">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
        :
        <div>
          <div className='flex justify-between p-5 gap-2' >
            <Link href='/'><Image src='/gadgetbro.png' alt='homelogo' width={80} height={10} /></Link>
            <div className=''>
              <Link href="/dashboard">
                <Button className="mx-4">Profile</Button>
              </Link>
              <LogoutButton/>
            </div>
          </div>
        </div>}
    </div>
  )
}

export default AdminNavbar
