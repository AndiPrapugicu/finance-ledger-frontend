import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  PieChart, 
  DollarSign, 
  Shield, 
  Smartphone, 
  Users 
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Navigation */}
      <nav className="relative z-10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">FL</span>
            </div>
            <span className="text-white text-xl font-bold">Finance Ledger</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link
              to="/login"
              className="text-gray-300 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-gray-800"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Master Your
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                {" "}Financial Future
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Take control of your finances with our comprehensive personal finance ledger. 
              Track expenses, manage accounts, and gain insights into your spending patterns 
              with beautiful, intuitive charts and reports.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all transform hover:scale-105 shadow-lg"
              >
                Start Free Today
              </Link>
              <Link
                to="/login"
                className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors border border-gray-600"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="px-6 py-20 bg-gray-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Everything You Need to Manage Your Money
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Powerful features designed to make personal finance management simple and effective.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gray-900/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700 hover:border-cyan-500/50 transition-colors">
              <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center mb-6">
                <TrendingUp className="h-6 w-6 text-cyan-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Smart Analytics</h3>
              <p className="text-gray-400">
                Get insights into your spending patterns with beautiful charts and detailed reports 
                that help you make informed financial decisions.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gray-900/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700 hover:border-cyan-500/50 transition-colors">
              <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-6">
                <PieChart className="h-6 w-6 text-orange-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Visual Reports</h3>
              <p className="text-gray-400">
                Transform your financial data into easy-to-understand visual reports with 
                interactive charts and customizable dashboards.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gray-900/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700 hover:border-cyan-500/50 transition-colors">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center mb-6">
                <DollarSign className="h-6 w-6 text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Account Management</h3>
              <p className="text-gray-400">
                Manage multiple accounts, track balances, and organize your finances 
                with a comprehensive account hierarchy system.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-gray-900/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700 hover:border-cyan-500/50 transition-colors">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-6">
                <Shield className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Secure & Private</h3>
              <p className="text-gray-400">
                Your financial data is protected with enterprise-grade security. 
                All data is encrypted and stored securely.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-gray-900/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700 hover:border-cyan-500/50 transition-colors">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-6">
                <Smartphone className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Mobile Friendly</h3>
              <p className="text-gray-400">
                Access your finances anywhere with our responsive design that works 
                perfectly on all devices.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-gray-900/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700 hover:border-cyan-500/50 transition-colors">
              <div className="w-12 h-12 bg-pink-500/20 rounded-lg flex items-center justify-center mb-6">
                <Users className="h-6 w-6 text-pink-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Personal & Secure</h3>
              <p className="text-gray-400">
                Built for individuals who want complete control over their personal 
                financial data with user-specific account isolation.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Take Control of Your Finances?
          </h2>
          <p className="text-gray-400 text-lg mb-8">
            Join thousands of users who have already transformed their financial lives 
            with our comprehensive personal finance ledger.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all transform hover:scale-105 shadow-lg"
            >
              Create Free Account
            </Link>
            <Link
              to="/login"
              className="text-cyan-400 hover:text-cyan-300 px-8 py-4 rounded-lg font-semibold text-lg transition-colors border border-cyan-500 hover:border-cyan-400"
            >
              Already have an account?
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-gray-800">
        <div className="max-w-7xl mx-auto text-center text-gray-400">
          <p>&copy; 2025 Finance Ledger. Built with ❤️ for personal finance management.</p>
        </div>
      </footer>
    </div>
  );
}