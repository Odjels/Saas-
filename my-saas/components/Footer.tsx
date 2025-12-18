import { FileText } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-2">
            <FileText className="w-6 h-6 text-indigo-600" />
            <span className="text-xl font-bold text-gray-900">InvoiceFlow</span>
          </div>
          
          <div className="text-center md:text-right">
            <p className="text-gray-600 text-sm">
              © {new Date().getFullYear()} <span className="font-semibold">InvoiceFlow</span>. All rights reserved.
            </p>
            <p className="text-gray-400 text-xs mt-1">
              Designed & Developed by <span className="text-gray-700 font-medium">Odegua</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}