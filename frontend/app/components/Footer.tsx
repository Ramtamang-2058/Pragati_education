export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-red-600 font-bold text-lg mb-4">Pragati IELTS</h3>
            <p className="text-gray-600 text-sm">
              Helping students achieve their desired IELTS scores through comprehensive practice and personalized study plans.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="/about" className="text-gray-600 hover:text-red-600 text-sm">About Us</a></li>
              <li><a href="/contact" className="text-gray-600 hover:text-red-600 text-sm">Contact</a></li>
              <li><a href="/blog" className="text-gray-600 hover:text-red-600 text-sm">Blog</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Resources</h4>
            <ul className="space-y-2">
              <li><a href="/practice-tests" className="text-gray-600 hover:text-red-600 text-sm">Practice Tests</a></li>
              <li><a href="/study-materials" className="text-gray-600 hover:text-red-600 text-sm">Study Materials</a></li>
              <li><a href="/tips" className="text-gray-600 hover:text-red-600 text-sm">IELTS Tips</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Connect</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-600 hover:text-red-600 text-sm">Facebook</a></li>
              <li><a href="#" className="text-gray-600 hover:text-red-600 text-sm">Twitter</a></li>
              <li><a href="#" className="text-gray-600 hover:text-red-600 text-sm">Instagram</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-100">
          <p className="text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} Pragati IELTS. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
