import Image from "next/image";
import Link from "next/link";
import { getServerSessionUser } from "../../../helpers/getUser";
import LogoutButton from "../../../components/logoutUser";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className='flex justify-around'>
        <Link href={'/'}>
          <Image src='/gadgetbro.png' alt='homelogo' width={80} height={50} />
        </Link>
        <LogoutButton/>
      </div>
      <main>{children}</main>
    </>
  );
}
