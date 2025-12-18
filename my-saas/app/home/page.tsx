import { FileText, Zap, Shield, TrendingUp, Palette } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <FileText className="w-8 h-8 text-indigo-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                InvoiceFlow
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="/login"
                className="text-gray-600 hover:text-gray-900 font-medium transition"
              >
                Login
              </a>
              <a
                href="/register"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all"
              >
                Get Started
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Create Professional Invoices
            <span className="block bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              in Seconds
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Streamline your billing process with our intuitive invoice
            generator. Choose from 3 professional templates designed for
            freelancers, small businesses, and enterprises.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/register"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:shadow-xl transition-all"
            >
              Start Free Trial
            </a>
          </div>
        </div>
      </section>

      {/* Templates Showcase Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-white rounded-3xl shadow-xl mb-20">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full mb-4">
            <Palette className="w-8 h-8 text-indigo-600" />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Perfect Template
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Select from three professionally designed invoice templates that
            match your brand and business style
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Modern Template */}
          <div className="group relative">
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-2xl border-2 border-indigo-200 hover:border-indigo-400 transition-all">
              {/* Template Preview */}
              <div className="bg-white rounded-lg shadow-lg p-4 mb-4 h-48 flex flex-col">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-12 -mx-4 -mt-4 rounded-t-lg flex items-center px-4">
                  <span className="text-white font-bold text-sm">INVOICE</span>
                </div>
                <div className="flex-1 flex flex-col justify-between py-2">
                  <div className="space-y-1">
                    <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="bg-indigo-600 h-8 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">TOTAL</span>
                  </div>
                </div>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">Modern</h3>
              <p className="text-gray-600 text-sm mb-3">
                Eye-catching gradient design with vibrant colors
              </p>
              <div className="flex flex-wrap gap-1">
                <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
                  Contemporary
                </span>
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                  Colorful
                </span>
                <span className="text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded-full">
                  Tech-savvy
                </span>
              </div>
            </div>
          </div>

          {/* Classic Template */}
          <div className="group relative">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-2xl border-2 border-gray-300 hover:border-gray-500 transition-all">
              {/* Template Preview */}
              <div className="bg-white rounded-lg shadow-lg p-4 mb-4 h-48 flex flex-col border-2 border-gray-800">
                <div className="border-b-2 border-gray-800 pb-2 mb-2">
                  <span className="text-gray-900 font-bold text-sm">
                    INVOICE
                  </span>
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div className="space-y-1 border-b border-gray-300 pb-2">
                    <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="border-t-4 border-b-4 border-gray-800 py-2">
                    <div className="h-2 bg-gray-800 rounded w-1/3 ml-auto"></div>
                  </div>
                </div>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">Classic</h3>
              <p className="text-gray-600 text-sm mb-3">
                Traditional business style with elegant borders
              </p>
              <div className="flex flex-wrap gap-1">
                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                  Professional
                </span>
                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                  Formal
                </span>
                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                  Corporate
                </span>
              </div>
            </div>
          </div>

          {/* Minimal Template */}
          <div className="group relative">
            <div className="bg-gradient-to-br from-slate-50 to-gray-50 p-6 rounded-2xl border-2 border-gray-200 hover:border-gray-400 transition-all">
              {/* Template Preview */}
              <div className="bg-white rounded-lg shadow-lg p-4 mb-4 h-48 flex flex-col">
                <div className="mb-2">
                  <span className="text-gray-800 font-bold text-lg">
                    Invoice
                  </span>
                  <div className="h-px bg-gray-300 mt-1"></div>
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="h-2 bg-gray-100 rounded w-3/4"></div>
                    <div className="h-2 bg-gray-100 rounded w-1/2"></div>
                  </div>
                  <div className="border-t border-gray-300 pt-2">
                    <div className="h-3 bg-gray-800 rounded w-1/3 ml-auto"></div>
                  </div>
                </div>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">Minimal</h3>
              <p className="text-gray-600 text-sm mb-3">
                Clean and simple design for maximum clarity
              </p>
              <div className="flex flex-wrap gap-1">
                <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-full">
                  Elegant
                </span>
                <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-full">
                  Simple
                </span>
                <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-full">
                  Modern
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            All templates available with Premium • Watermark-free PDFs • Instant
            downloads
          </p>
          <a
            href="/register"
            className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
          >
            Try All Templates Free
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-gray-100">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Lightning Fast
            </h3>
            <p className="text-gray-600">
              Generate invoices in seconds with our streamlined workflow. No
              more tedious manual entry.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-gray-100">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Secure & Reliable
            </h3>
            <p className="text-gray-600">
              Your data is encrypted and protected with enterprise-grade
              security standards.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-gray-100">
            <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-pink-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Track Performance
            </h3>
            <p className="text-gray-600">
              Monitor your invoices, payments, and business growth with detailed
              analytics.
            </p>
          </div>
        </div>
      </section>

     
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-gray-600">
            Everything you need to get paid faster.
          </p>
        </div>
        <div className="max-w-md mx-auto bg-white rounded-3xl shadow-2xl border-2 border-indigo-600 p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-indigo-600 text-white px-4 py-1 rounded-bl-lg text-sm font-bold">
            POPULAR
          </div>
          <h3 className="text-2xl font-bold mb-2">Premium Plan</h3>
          <div className="flex items-baseline mb-6">
            <span className="text-5xl font-extrabold text-gray-900">
              ₦5,000
            </span>
            <span className="text-gray-500 ml-2">/one-time</span>
          </div>
          <ul className="space-y-4 mb-8">
            <li className="flex items-center text-gray-600">
              <Zap className="w-5 h-5 text-green-500 mr-2" /> Unlimited Invoices
            </li>
            <li className="flex items-center text-gray-600">
              <Zap className="w-5 h-5 text-green-500 mr-2" /> 3 Professional
              Templates
            </li>
            <li className="flex items-center text-gray-600">
              <Zap className="w-5 h-5 text-green-500 mr-2" /> No Watermarks
            </li>
            <li className="flex items-center text-gray-600">
              <Zap className="w-5 h-5 text-green-500 mr-2" /> PDF Exports
            </li>
          </ul>
          <a
            href="/register"
            className="block text-center bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition"
          >
            Get Started Now
          </a>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Invoicing?
          </h2>
          <p className="text-indigo-100 text-lg mb-8">
            Join thousands of businesses already using InvoiceFlow
          </p>
          <a
            href="/register"
            className="bg-white text-indigo-600 px-8 py-4 rounded-lg font-semibold text-lg hover:shadow-xl transition-all inline-block"
          >
            Get Started Free
          </a>
        </div>
      </section>
    </div>
  );
}
