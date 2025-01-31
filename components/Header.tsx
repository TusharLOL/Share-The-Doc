import Image from 'next/image'
import React from 'react'
import logo from "@/assets/images/logo.png";
import Link from 'next/link';

const Header = () => {
    return (
        <div className="flex justify-between items-center p-4 border-b fixed w-screen">
            <Image
                src={logo}
                alt="Logo"
                width={70}
                height={70}
            />
            <div>
                <Link href="/about">About</Link>
            </div>
        </div>
    )
}

export default Header