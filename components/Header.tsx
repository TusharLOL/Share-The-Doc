import logo from "@/assets/images/logo.png";
import Image from 'next/image';

const Header = () => {
    return (
        <div className="flex h-[7rem] justify-between items-center p-4 border-b max-w-screen bg-black shadow-sm shadow-gray-400 ">
            <Image
                src={logo}
                alt="Logo"
                width={70}
                height={70}
            />
            <div className="flex items-center space-x-4 text-white text-3xl font-bold tracking-wider">
                Share the doc
            </div>
        </div>
    )
}

export default Header