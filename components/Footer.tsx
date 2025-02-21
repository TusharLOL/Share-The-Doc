import { Github, Linkedin, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-black text-white p-6 text-center">
      <div className="flex flex-col md:flex-row justify-center items-center gap-4">
        <a 
          href="https://github.com/ganeshb2334" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 hover:text-gray-400 transition"
        >
          <Github size={20} /> GitHub
        </a>
        <a 
          href="https://linkedin.com/in/ganeshbastapure" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 hover:text-gray-400 transition"
        >
          <Linkedin size={20} /> LinkedIn
        </a>
        <a 
          href="mailto:bastapureganesh21@gmail.com" 
          className="flex items-center gap-2 hover:text-gray-400 transition"
        >
          <Mail size={20} /> bastapureganesh21@gmail.com
        </a>
      </div>
      <p className="mt-4 text-sm text-gray-400">&copy; {new Date().getFullYear()} Ganesh Bastapure. All Rights Reserved.</p>
    </footer>
  );
};

export default Footer;