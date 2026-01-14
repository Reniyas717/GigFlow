import { Link } from 'react-router-dom';
import LightRays from '../../components/LightRays';
import { Briefcase, Users, Shield, Zap, CheckCircle, TrendingUp, Sun, Moon, Star, ArrowRight, Sparkles, Target, Clock, Award } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function LandingPage() {
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:bg-gradient-to-br dark:from-black dark:via-gray-900 dark:to-black">
            {/* Animated Background Overlay */}
            <div className="fixed inset-0 z-0 opacity-30 dark:opacity-20">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-300 dark:bg-purple-900 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-3xl animate-float"></div>
                <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-300 dark:bg-blue-900 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
                <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-300 dark:bg-pink-900 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
            </div>

            {/* Theme Toggle - Fixed Position */}
            <button
                onClick={toggleTheme}
                className="fixed top-6 right-6 z-50 p-3 rounded-full bg-white/90 dark:bg-gray-900/90 shadow-xl hover:shadow-2xl transition-all transform hover:scale-110 border border-gray-200 dark:border-gray-700 backdrop-blur-sm"
                aria-label="Toggle theme"
            >
                {theme === 'light' ? (
                    <Moon size={24} className="text-indigo-600" />
                ) : (
                    <Sun size={24} className="text-yellow-400" />
                )}
            </button>

            {/* Hero Section with Enhanced LightRays */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
                {/* Enhanced LightRays Background */}
                <div className="absolute inset-0 z-0 opacity-60 dark:opacity-80">
                    <LightRays
                        raysOrigin="top-center"
                        raysColor={theme === 'light' ? "#6366f1" : "#818cf8"}
                        raysSpeed={2}
                        lightSpread={0.6}
                        rayLength={1.5}
                        followMouse={true}
                        mouseInfluence={0.2}
                        noiseAmount={0.15}
                        distortion={0.08}
                        fadeDistance={0.9}
                        saturation={1.2}
                    />
                </div>

                {/* Gradient Overlay for better text visibility */}
                <div className="absolute inset-0 z-[1] bg-gradient-to-b from-transparent via-white/30 to-white/60 dark:via-black/30 dark:to-black/60"></div>

                <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-full border border-indigo-200 dark:border-indigo-800 mb-8 animate-fade-in">
                        <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Welcome to the Future of Freelancing</span>
                    </div>

                    <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black mb-6 animate-fade-in">
                        <span className="gradient-text">GigFlow</span>
                    </h1>
                    <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 dark:text-white mb-6 animate-fade-in">
                        Where Talent Meets Opportunity
                    </p>
                    <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto animate-fade-in leading-relaxed">
                        Connect with top freelancers or find your next project. GigFlow makes hiring and getting hired simple, secure, and efficient with cutting-edge technology.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
                        <Link
                            to="/register"
                            className="group px-10 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-lg font-bold rounded-xl shadow-2xl hover:shadow-indigo-500/50 transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
                        >
                            Get Started Free
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            to="/login"
                            className="px-10 py-5 bg-white/90 dark:bg-gray-900/90 hover:bg-white dark:hover:bg-gray-800 text-indigo-600 dark:text-indigo-400 text-lg font-bold rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border-2 border-indigo-600 dark:border-indigo-400 backdrop-blur-sm"
                        >
                            Sign In
                        </Link>
                    </div>

                    {/* Trust Indicators */}
                    <div className="mt-16 flex flex-wrap justify-center gap-8 text-sm text-gray-600 dark:text-gray-400 animate-fade-in">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            <span>No Credit Card Required</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            <span>Free Forever Plan</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            <span>Cancel Anytime</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section - Enhanced */}
            <section className="relative py-24 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-20">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-full mb-6">
                            <Star className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                            <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">FEATURES</span>
                        </div>
                        <h2 className="text-5xl sm:text-6xl font-black mb-6 text-gray-900 dark:text-white">
                            Why Choose <span className="gradient-text">GigFlow</span>?
                        </h2>
                        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                            Everything you need to succeed in the modern gig economy
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <Briefcase className="w-14 h-14" />,
                                title: 'Post Jobs Easily',
                                description: 'Create detailed job listings in minutes with our intuitive interface. Set your budget, requirements, and timeline effortlessly.',
                                color: 'from-blue-500 to-cyan-500'
                            },
                            {
                                icon: <Users className="w-14 h-14" />,
                                title: 'Find Top Talent',
                                description: 'Browse qualified freelancers, review portfolios, and find the perfect match for your project needs.',
                                color: 'from-purple-500 to-pink-500'
                            },
                            {
                                icon: <Shield className="w-14 h-14" />,
                                title: 'Secure Payments',
                                description: 'Enterprise-grade security and transparent pricing ensure safe, reliable transactions every time.',
                                color: 'from-green-500 to-emerald-500'
                            },
                            {
                                icon: <Zap className="w-14 h-14" />,
                                title: 'Fast Hiring',
                                description: 'Review bids and hire freelancers instantly with our streamlined, lightning-fast process.',
                                color: 'from-yellow-500 to-orange-500'
                            },
                            {
                                icon: <CheckCircle className="w-14 h-14" />,
                                title: 'Quality Guaranteed',
                                description: 'Work with verified professionals committed to delivering excellence and exceeding expectations.',
                                color: 'from-indigo-500 to-purple-500'
                            },
                            {
                                icon: <TrendingUp className="w-14 h-14" />,
                                title: 'Scale Effortlessly',
                                description: 'Grow your business with unlimited access to a global talent pool of skilled professionals.',
                                color: 'from-pink-500 to-red-500'
                            }
                        ].map((feature, index) => (
                            <div
                                key={index}
                                className="group relative p-8 rounded-3xl glass hover:shadow-2xl transform hover:scale-105 hover:-translate-y-2 transition-all duration-500 overflow-hidden"
                            >
                                {/* Gradient Background on Hover */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>

                                <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.color} text-white mb-6 shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
                                    {feature.icon}
                                </div>
                                <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works Section - Enhanced */}
            <section className="relative py-24 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:bg-gradient-to-br dark:from-black dark:via-gray-900 dark:to-black">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-20">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-6">
                            <Target className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">PROCESS</span>
                        </div>
                        <h2 className="text-5xl sm:text-6xl font-black mb-6 text-gray-900 dark:text-white">
                            How It Works
                        </h2>
                        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                            Get started in three simple steps and transform your workflow
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                        {/* Connection Lines */}
                        <div className="hidden md:block absolute top-24 left-1/4 right-1/4 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-30"></div>

                        {[
                            {
                                step: '01',
                                title: 'Post or Browse',
                                description: 'Clients post jobs with budgets and requirements. Freelancers browse thousands of open opportunities.',
                                icon: <Briefcase className="w-8 h-8" />
                            },
                            {
                                step: '02',
                                title: 'Submit Bids',
                                description: 'Freelancers submit competitive bids with detailed proposals, timelines, and pricing.',
                                icon: <Clock className="w-8 h-8" />
                            },
                            {
                                step: '03',
                                title: 'Get Hired',
                                description: 'Clients review bids, compare proposals, and hire the best freelancer for their project.',
                                icon: <Award className="w-8 h-8" />
                            }
                        ].map((step, index) => (
                            <div key={index} className="relative text-center group">
                                <div className="relative inline-block mb-8">
                                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                                    <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white text-3xl font-black shadow-2xl group-hover:scale-110 transition-transform duration-300">
                                        {step.step}
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 p-3 bg-white dark:bg-gray-900 rounded-full shadow-lg">
                                        {step.icon}
                                    </div>
                                </div>
                                <h3 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
                                    {step.title}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed max-w-sm mx-auto">
                                    {step.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Statistics Section - Enhanced */}
            <section className="relative py-24 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white overflow-hidden">
                {/* Animated Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '50px 50px' }}></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl sm:text-5xl font-black mb-4">
                            Trusted by Thousands Worldwide
                        </h2>
                        <p className="text-xl opacity-90">
                            Join our growing community of successful freelancers and clients
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                        {[
                            { number: '10,000+', label: 'Jobs Posted', icon: <Briefcase className="w-12 h-12 mx-auto mb-4" /> },
                            { number: '5,000+', label: 'Active Freelancers', icon: <Users className="w-12 h-12 mx-auto mb-4" /> },
                            { number: '98%', label: 'Success Rate', icon: <TrendingUp className="w-12 h-12 mx-auto mb-4" /> }
                        ].map((stat, index) => (
                            <div key={index} className="group">
                                <div className="p-8 rounded-3xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                                    {stat.icon}
                                    <div className="text-6xl sm:text-7xl font-black mb-3 animate-pulse-glow">
                                        {stat.number}
                                    </div>
                                    <div className="text-2xl font-semibold opacity-90">
                                        {stat.label}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA Section - Enhanced */}
            <section className="relative py-24 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-full mb-8">
                        <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">GET STARTED TODAY</span>
                    </div>

                    <h2 className="text-5xl sm:text-6xl font-black mb-6 text-gray-900 dark:text-white">
                        Ready to Get Started?
                    </h2>
                    <p className="text-xl text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
                        Join thousands of clients and freelancers already using GigFlow to build successful projects and careers
                    </p>

                    <Link
                        to="/register"
                        className="group inline-flex items-center gap-3 px-12 py-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white text-xl font-black rounded-2xl shadow-2xl hover:shadow-indigo-500/50 transform hover:scale-105 transition-all duration-300"
                    >
                        Create Your Free Account
                        <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                    </Link>

                    <p className="mt-6 text-sm text-gray-500 dark:text-gray-500">
                        No credit card required • Free forever plan • Cancel anytime
                    </p>
                </div>
            </section>

            {/* Footer - Enhanced */}
            <footer className="relative py-12 bg-gradient-to-br from-gray-900 to-black text-gray-400">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h3 className="text-3xl font-bold gradient-text mb-4">GigFlow</h3>
                        <p className="mb-6">Where Talent Meets Opportunity</p>
                        <div className="flex justify-center gap-6 mb-6">
                            <a href="#" className="hover:text-white transition-colors">About</a>
                            <a href="#" className="hover:text-white transition-colors">Features</a>
                            <a href="#" className="hover:text-white transition-colors">Pricing</a>
                            <a href="#" className="hover:text-white transition-colors">Contact</a>
                        </div>
                        <p className="text-sm">&copy; 2026 GigFlow. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
