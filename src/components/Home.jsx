import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  Layers, 
  PiggyBank, 
  Shield, 
  Zap, 
  DollarSign, 
  Lock,
  ChartBar,
  Users
} from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, description }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="bg-emerald-800/20 rounded-lg p-6 backdrop-blur-sm"
  >
    <div className="bg-lime-300 rounded-full w-12 h-12 flex items-center justify-center mb-4">
      <Icon className="h-6 w-6 text-emerald-900" />
    </div>
    <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
    <p className="text-lime-100 opacity-80">{description}</p>
  </motion.div>
);

const StepCard = ({ number, title, description }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: number * 0.2 }}
    className="relative bg-emerald-800/30 rounded-lg p-6"
  >
    <div className="absolute -top-4 -left-4 w-8 h-8 bg-lime-300 rounded-full flex items-center justify-center text-emerald-900 font-bold">
      {number}
    </div>
    <h3 className="text-xl font-semibold text-white mb-2 mt-2">{title}</h3>
    <p className="text-lime-100 opacity-80">{description}</p>
  </motion.div>
);

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-900 via-emerald-800 to-emerald-900">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="container mx-auto px-4 pt-20 pb-32"
      >
        <div className="text-center mb-16">
          <motion.h1 
            className="text-6xl font-bold tracking-tight text-white mb-6"
            style={{ fontFamily: 'monospace' }}
          >
            DCS FINANCE
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xl text-lime-100 max-w-2xl mx-auto"
          >
            Your decentralized lending and borrowing platform designed for the future of finance
          </motion.p>
        </div>

        {/* Main Cards Section */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link to="/borrower">
              <div className="rounded-lg bg-emerald-800/90 p-8 h-full border border-lime-200/20 hover:border-lime-200/40 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <PiggyBank className="h-8 w-8 text-lime-300" />
                  <ArrowRight className="h-6 w-6 text-lime-300" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">I'm a Borrower</h2>
                <p className="text-lime-100 opacity-90">Access flexible lending options with competitive rates</p>
              </div>
            </Link>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link to="/lender">
              <div className="rounded-lg bg-emerald-800/90 p-8 h-full border border-lime-200/20 hover:border-lime-200/40 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <Layers className="h-8 w-8 text-lime-300" />
                  <ArrowRight className="h-6 w-6 text-lime-300" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">I'm a Lender</h2>
                <p className="text-lime-100 opacity-90">Earn returns by providing liquidity to the platform</p>
              </div>
            </Link>
          </motion.div>
        </div>

        {/* Stats Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-20 text-center"
        >
          <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="bg-emerald-800/30 rounded-lg p-6">
              <div className="text-3xl font-bold text-white">$56M</div>
              <div className="text-lime-200 text-sm">Total Value Locked</div>
            </div>
            <div className="bg-emerald-800/30 rounded-lg p-6">
              <div className="text-3xl font-bold text-white">12K+</div>
              <div className="text-lime-200 text-sm">Active Users</div>
            </div>
            <div className="bg-emerald-800/30 rounded-lg p-6">
              <div className="text-3xl font-bold text-white">5.2%</div>
              <div className="text-lime-200 text-sm">Avg. APY</div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Features Section */}
      <div className="bg-gradient-to-b from-emerald-900/50 to-emerald-800/50 py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">Why Choose DCS Finance?</h2>
            <p className="text-lime-100 opacity-80 max-w-2xl mx-auto">
              Experience the future of decentralized finance with our innovative platform
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <FeatureCard 
              icon={Shield}
              title="Secure & Transparent"
              description="Built on blockchain technology ensuring complete transparency and security of your assets"
            />
            <FeatureCard 
              icon={Zap}
              title="Lightning Fast"
              description="Quick approval and instant transactions for both lenders and borrowers"
            />
            <FeatureCard 
              icon={DollarSign}
              title="Competitive Rates"
              description="Get the best lending and borrowing rates in the DeFi market"
            />
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-20 bg-emerald-900/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-lime-100 opacity-80 max-w-2xl mx-auto">
              Getting started with DCS Finance is simple and straightforward
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <StepCard 
              number={1}
              title="Connect Wallet"
              description="Link your crypto wallet to access the platform"
            />
            <StepCard 
              number={2}
              title="Choose Your Role"
              description="Decide whether you want to lend or borrow"
            />
            <StepCard 
              number={3}
              title="Select Terms"
              description="Pick the amount and duration that suits your needs"
            />
            <StepCard 
              number={4}
              title="Start Trading"
              description="Begin your DeFi journey with secure transactions"
            />
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-20 bg-emerald-800/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">What Our Users Say</h2>
            <p className="text-lime-100 opacity-80 max-w-2xl mx-auto">
              Join thousands of satisfied users who trust DCS Finance
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="bg-emerald-800/20 rounded-lg p-6 backdrop-blur-sm"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-lime-300 rounded-full"></div>
                  <div className="ml-4">
                    <div className="text-white font-semibold">User {i}</div>
                    <div className="text-lime-200 text-sm">Active Lender</div>
                  </div>
                </div>
                <p className="text-lime-100 opacity-80">
                  "DCS Finance has revolutionized the way I manage my crypto assets. The platform is intuitive and the returns are exceptional."
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto bg-gradient-to-r from-emerald-600 to-emerald-800 rounded-lg p-12 text-center"
          >
            <h2 className="text-4xl font-bold text-white mb-4">Ready to Get Started?</h2>
            <p className="text-lime-100 opacity-90 mb-8 max-w-2xl mx-auto">
              Join the future of decentralized finance today and experience the benefits of our platform
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-lime-300 text-emerald-900 px-8 py-3 rounded-lg font-semibold text-lg hover:bg-lime-200 transition-colors"
            >
              Connect Wallet
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-emerald-900/50 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div>
              <h3 className="text-white font-bold text-lg mb-4">DCS Finance</h3>
              <p className="text-lime-100 opacity-80">
                Your trusted platform for decentralized lending and borrowing
              </p>
            </div>
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-lime-100 hover:text-lime-200">About Us</a></li>
                <li><a href="#" className="text-lime-100 hover:text-lime-200">How It Works</a></li>
                <li><a href="#" className="text-lime-100 hover:text-lime-200">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-lime-100 hover:text-lime-200">Privacy Policy</a></li>
                <li><a href="#" className="text-lime-100 hover:text-lime-200">Terms of Service</a></li>
                <li><a href="#" className="text-lime-100 hover:text-lime-200">Security</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Connect</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-lime-100 hover:text-lime-200">Twitter</a></li>
                <li><a href="#" className="text-lime-100 hover:text-lime-200">Discord</a></li>
                <li><a href="#" className="text-lime-100 hover:text-lime-200">Telegram</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;