import { Link } from "react-router-dom";
import { Logo } from "./logo";
import { Github, Twitter, Linkedin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Logo className="w-32" />
            <p className="text-sm text-gray-400">
              Next-generation AI voice technology with emotional intelligence.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-purple-400">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-purple-400">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-purple-400">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Product</h3>
            <ul className="space-y-2">
              <li><Link to="/marketplace" className="hover:text-purple-400">Marketplace</Link></li>
              <li><Link to="/dashboard" className="hover:text-purple-400">Voice Studio</Link></li>
              <li><a href="#" className="hover:text-purple-400">Pricing</a></li>
              <li><a href="#" className="hover:text-purple-400">API</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-purple-400">Documentation</a></li>
              <li><a href="#" className="hover:text-purple-400">Tutorials</a></li>
              <li><a href="#" className="hover:text-purple-400">Blog</a></li>
              <li><a href="#" className="hover:text-purple-400">Support</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Company</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-purple-400">About</a></li>
              <li><a href="#" className="hover:text-purple-400">Careers</a></li>
              <li><a href="#" className="hover:text-purple-400">Privacy</a></li>
              <li><a href="#" className="hover:text-purple-400">Terms</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-sm text-gray-400">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p>&copy; {new Date().getFullYear()} Speaker. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-purple-400">Privacy Policy</a>
              <a href="#" className="hover:text-purple-400">Terms of Service</a>
              <a href="#" className="hover:text-purple-400">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}