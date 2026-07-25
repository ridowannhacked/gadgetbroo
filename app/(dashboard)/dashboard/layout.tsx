import Image from "next/image";
import Link from "next/link";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className='content-center'>
        <Link href={'/'}>
          <Image src='/gadgetbro.png' alt='homelogo' width={80} height={50} />
        </Link>
      </div>
      <main>{children}</main>
    </>
  );
}
