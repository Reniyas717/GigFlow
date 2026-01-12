import { Link } from 'react-router-dom';
import LightRays from '../../components/LightRays';
import { Briefcase, Users, Shield, Zap, CheckCircle, TrendingUp } from 'lucide-react';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
            {/* Hero Section with LightRays */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <LightRays
                        raysOrigin="top-center"
                        raysColor="#7C3AED"
                        raysSpeed={1.5}
                        lightSpread={0.8}
                        rayLength={1.2}
                        followMouse={true}
                        mouseInfluence={0.15}
                        noiseAmount={0.1}
                        distortion={0.05}
                    />
                </div>

                <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 animate-fade-in">
                        <span className="gradient-text">GigFlow</span>
                    </h1>
                    <p className="text-xl sm:text-2xl lg:text-3xl text-gray-700 dark:text-gray-300 mb-8 animate-fade-in">
                        Where Talent Meets Opportunity
                    </p>
                    <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-12 max-w-3xl mx-auto animate-fade-in">
                        Connect with top freelancers or find your next project. GigFlow makes hiring and getting hired simple, secure, and efficient.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
                        <Link
                            to="/register"
                            className="px-8 py-4 bg-violet-600 hover:bg-violet-700 text-white text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                            Get Started Free
                        </Link>
                        <Link
                            to="/login"
                            className="px-8 py-4 bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 text-violet-600 dark:text-violet-400 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-violet-600 dark:border-violet-400"
                        >
                            Sign In
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-white dark:bg-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
                            Why Choose GigFlow?
                        </h2>
                        <p className="text-xl text-gray-600 dark:text-gray-400">
                            Everything you need to succeed in the gig economy
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <Briefcase className="w-12 h-12" />,
                                title: 'Post Jobs Easily',
                                description: 'Create detailed job listings in minutes. Set your budget, requirements, and timeline.'
                            },
                            {
                                icon: <Users className="w-12 h-12" />,
                                title: 'Find Top Talent',
                                description: 'Browse qualified freelancers and review their bids to find the perfect match.'
                            },
                            {
                                icon: <Shield className="w-12 h-12" />,
                                title: 'Secure Payments',
                                description: 'Built-in security and transparent pricing ensure safe transactions.'
                            },
                            {
                                icon: <Zap className="w-12 h-12" />,
                                title: 'Fast Hiring',
                                description: 'Review bids and hire freelancers instantly with our streamlined process.'
                            },
                            {
                                icon: <CheckCircle className="w-12 h-12" />,
                                title: 'Quality Work',
                                description: 'Work with verified professionals committed to delivering excellence.'
                            },
                            {
                                icon: <TrendingUp className="w-12 h-12" />,
                                title: 'Grow Your Business',
                                description: 'Scale your projects with access to a global talent pool.'
                            }
                        ].map((feature, index) => (
                            <div
                                key={index}
                                className="p-8 rounded-2xl glass hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                            >
                                <div className="text-violet-600 dark:text-violet-400 mb-4">
                                    {feature.icon}
                                </div>
                                <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-20 bg-gray-50 dark:bg-slate-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
                            How It Works
                        </h2>
                        <p className="text-xl text-gray-600 dark:text-gray-400">
                            Get started in three simple steps
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {[
                            {
                                step: '01',
                                title: 'Post or Browse',
                                description: 'Clients post jobs with budgets. Freelancers browse open opportunities.'
                            },
                            {
                                step: '02',
                                title: 'Submit Bids',
                                description: 'Freelancers submit competitive bids with their proposals and pricing.'
                            },
                            {
                                step: '03',
                                title: 'Get Hired',
                                description: 'Clients review bids and hire the best freelancer for their project.'
                            }
                        ].map((step, index) => (
                            <div key={index} className="text-center">
                                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-violet-600 to-amber-600 text-white text-2xl font-bold mb-6 shadow-lg">
                                    {step.step}
                                </div>
                                <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">
                                    {step.title}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 text-lg">
                                    {step.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Statistics Section */}
            <section className="py-20 bg-gradient-to-br from-violet-600 to-amber-600 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                        {[
                            { number: '10,000+', label: 'Jobs Posted' },
                            { number: '5,000+', label: 'Freelancers' },
                            { number: '98%', label: 'Success Rate' }
                        ].map((stat, index) => (
                            <div key={index}>
                                <div className="text-5xl sm:text-6xl font-bold mb-2">
                                    {stat.number}
                                </div>
                                <div className="text-xl sm:text-2xl opacity-90">
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA Section */}
            <section className="py-20 bg-white dark:bg-slate-800">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
                        Ready to Get Started?
                    </h2>
                    <p className="text-xl text-gray-600 dark:text-gray-400 mb-10">
                        Join thousands of clients and freelancers already using GigFlow
                    </p>
                    <Link
                        to="/register"
                        className="inline-block px-10 py-5 bg-gradient-to-r from-violet-600 to-amber-600 hover:from-violet-700 hover:to-amber-700 text-white text-xl font-semibold rounded-lg shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300"
                    >
                        Create Your Free Account
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 bg-gray-900 text-gray-400 text-center">
                <p>&copy; 2026 GigFlow. All rights reserved.</p>
            </footer>
        </div>
    );
}
