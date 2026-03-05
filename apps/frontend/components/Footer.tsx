// frontend/components/Footer.tsx

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-200 py-8 mt-12">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Brand */}
        <div>
          <h4 className="font-bold mb-2">SmartShop</h4>
          <p className="text-sm">Quality products, great prices.</p>
        </div>

        {/* Company Section */}
        <div>
          <h4 className="font-semibold mb-2">Company</h4>
          <ul className="text-sm space-y-1">
            <li>About</li>
            <li>Careers</li>
            <li>Seller Portal</li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h4 className="font-semibold mb-2">Support</h4>
          <ul className="text-sm space-y-1">
            <li>Help Center</li>
            <li>Returns</li>
            <li>Contact</li>
          </ul>
        </div>

      </div>

      <div className="max-w-7xl mx-auto px-4 mt-6 text-sm text-gray-400">
        © {new Date().getFullYear()} SmartShop. All rights reserved.
      </div>
    </footer>
  );
}
