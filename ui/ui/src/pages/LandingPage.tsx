import { useNavigate } from 'react-router-dom';
import {
    Anchor,
    ArrowRight,
    AlertTriangle,
    Radar,
    Bot,
    Zap,
    Check,
    TrendingUp,
    Network,
    TrainFront,
    Calculator,
    Layers,
    Twitter,
    Linkedin,
    Facebook,
    Container,
    Globe,
    BarChart3,
    TrainTrack
} from 'lucide-react';

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="bg-white text-slate-900 antialiased selection:bg-blue-100 selection:text-blue-900 font-inter">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-6 px-4">
                <div className="bg-white/80 backdrop-blur-md border border-slate-200/60 shadow-sm rounded-full px-6 py-3 flex items-center justify-between w-full max-w-5xl">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-blue-600 rounded-full pt-1 flex items-center justify-center">
                            <img src="/assets/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
                        </div>
                        <span className="text-lg font-medium tracking-tight text-slate-800">SAIL LOGISTICS</span>
                    </div>

                    <div className="hidden md:flex items-center gap-8">
                        <a href="#" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Platform</a>
                        <a href="#" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Capabilities</a>
                        <a href="#" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Perspectives</a>
                        <a href="#" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Financials</a>
                    </div>

                    <button
                        onClick={() => navigate('/login')}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2 rounded-full transition-all shadow-[0_1px_2px_rgba(0,0,0,0.1)]"
                    >
                        Login
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-40 pb-20 px-6 max-w-7xl mx-auto text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-medium mb-8">
                    <span className="flex h-2 w-2 rounded-full bg-blue-600"></span>
                    Now Live: AI Resolution Proposals
                </div>

                <h1 className="text-5xl md:text-7xl font-medium tracking-tight text-slate-900 mb-6 max-w-5xl mx-auto leading-[1.1]">
                    Predictive Logistics for the <br className="hidden md:block" />
                    <span className="text-blue-600">Sail Industry</span>
                </h1>

                <p className="text-xl text-slate-500 max-w-3xl mx-auto mb-10 font-light leading-relaxed">
                    A Digital Twin-powered platform designed to modernize logistics for SAIL. Move beyond basic tracking to predictive self-healing—using AI to predict port congestion and automate cost-saving solutions.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                    <button
                        onClick={() => navigate('/login')}
                        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white text-lg font-medium px-8 py-3.5 rounded-full shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
                    >
                        Explore Platform
                        <ArrowRight className="w-5 h-5" />
                    </button>
                    <button className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-lg font-medium px-8 py-3.5 rounded-full transition-all">
                        View Documentation
                    </button>
                </div>

                {/* Hero Video */}
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200 max-w-6xl mx-auto group">
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent z-10"></div>
                    <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-[400px] md:h-[600px] object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                    >
                        <source src="/assets/hero_video.mp4" type="video/mp4" />
                    </video>

                    {/* Floating UI Element */}
                    <div className="absolute bottom-8 left-8 right-8 md:left-auto md:right-8 md:w-96 bg-white/95 backdrop-blur shadow-lg rounded-xl p-5 border border-slate-100 z-20 text-left">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Disruption Alert</p>
                                <p className="text-base font-medium text-slate-800">Port Congestion Detected</p>
                            </div>
                            <div className="bg-red-50 text-red-600 p-1.5 rounded-md">
                                <AlertTriangle className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-500">Delay Impact</span>
                                <span className="text-red-600 font-medium">+48 Hours</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-500">AI Recommendation</span>
                                <span className="text-blue-600 font-medium">Reroute to Paradip</span>
                            </div>
                            <button className="w-full mt-2 bg-slate-900 text-white text-sm py-2 rounded-lg font-medium hover:bg-slate-800 transition-colors">Apply Optimization</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Partners / Stats */}
            <section className="py-10 border-y border-slate-100 bg-slate-50/50">
                <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center md:justify-between items-center gap-8 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
                    <div className="flex items-center gap-2">
                        <Anchor className="w-6 h-6 text-slate-800" />
                        <span className="text-lg font-semibold text-slate-800">PortConnect</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <TrainTrack className="w-6 h-6 text-slate-800" />
                        <span className="text-lg font-semibold text-slate-800">RailDispatch</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Container className="w-6 h-6 text-slate-800" />
                        <span className="text-lg font-semibold text-slate-800">SteelFreight</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Globe className="w-6 h-6 text-slate-800" />
                        <span className="text-lg font-semibold text-slate-800">GlobalLogistics</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <BarChart3 className="w-6 h-6 text-slate-800" />
                        <span className="text-lg font-semibold text-slate-800">FinTech Ops</span>
                    </div>
                </div>
            </section>

            {/* Feature Section 1: Self Healing */}
            <section className="py-24 px-6 max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-medium tracking-tight text-slate-900 mb-4">The "Self-Healing" Control Tower</h2>
                    <p className="text-xl text-slate-500 max-w-2xl mx-auto">Disruptions like weather and strikes are inevitable. Manual replanning takes hours. Our AI resolves them in seconds.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Card 1 */}
                    <div className="p-8 rounded-2xl border border-slate-200 bg-white hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300">
                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-6">
                            <Radar className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-medium text-slate-900 mb-3">Real-time Risk Detection</h3>
                        <p className="text-lg text-slate-500 leading-relaxed">The system continuously monitors weather patterns, strike alerts, and port congestion to detect risks before they impact your timeline.</p>
                    </div>

                    {/* Card 2 */}
                    <div className="p-8 rounded-2xl border border-slate-200 bg-white hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300">
                        <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 mb-6">
                            <Bot className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-medium text-slate-900 mb-3">AI Resolution Proposal</h3>
                        <p className="text-lg text-slate-500 leading-relaxed">Generates instant "AI Resolution Proposals". Whether rerouting vessels or switching from Sea to Rail, the best path is calculated automatically.</p>
                    </div>

                    {/* Card 3 */}
                    <div className="p-8 rounded-2xl border border-slate-200 bg-white hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300">
                        <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 mb-6">
                            <Zap className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-medium text-slate-900 mb-3">One-Click Optimization</h3>
                        <p className="text-lg text-slate-500 leading-relaxed">Execute complex logistical changes with a single click. The system handles the downstream communication to ports and rail officers.</p>
                    </div>
                </div>
            </section>

            {/* Split Section: Role Based */}
            <section className="py-24 bg-slate-50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                        {/* Left Content */}
                        <div>
                            <h2 className="text-3xl md:text-5xl font-medium tracking-tight text-slate-900 mb-6">Role-Based Perspectives</h2>
                            <p className="text-xl text-slate-500 mb-10 leading-relaxed">
                                Eliminate information overload. We provide personalized dashboards tailored to the specific needs of your workforce, from the C-Suite to the Port Manager.
                            </p>

                            <div className="space-y-6">
                                {/* Item 1 */}
                                <div className="flex gap-4 group cursor-pointer">
                                    <div className="mt-1">
                                        <div className="w-6 h-6 rounded-full border border-slate-300 flex items-center justify-center group-hover:border-blue-600 group-hover:bg-blue-600 transition-colors">
                                            <Check className="w-3.5 h-3.5 text-transparent group-hover:text-white" />
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-medium text-slate-900 group-hover:text-blue-600 transition-colors">Finance CFO</h4>
                                        <p className="text-lg text-slate-500 mt-1">Focuses on Cost Efficiency and Demurrage Savings. See the bottom-line impact of every logistics move.</p>
                                    </div>
                                </div>

                                {/* Item 2 */}
                                <div className="flex gap-4 group cursor-pointer">
                                    <div className="mt-1">
                                        <div className="w-6 h-6 rounded-full border border-slate-300 flex items-center justify-center group-hover:border-blue-600 group-hover:bg-blue-600 transition-colors">
                                            <Check className="w-3.5 h-3.5 text-transparent group-hover:text-white" />
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-medium text-slate-900 group-hover:text-blue-600 transition-colors">Port Manager</h4>
                                        <p className="text-lg text-slate-500 mt-1">Views only their specific Port's vessel queue, crane maintenance schedules, and stock levels.</p>
                                    </div>
                                </div>

                                {/* Item 3 */}
                                <div className="flex gap-4 group cursor-pointer">
                                    <div className="mt-1">
                                        <div className="w-6 h-6 rounded-full border border-slate-300 flex items-center justify-center group-hover:border-blue-600 group-hover:bg-blue-600 transition-colors">
                                            <Check className="w-3.5 h-3.5 text-transparent group-hover:text-white" />
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-medium text-slate-900 group-hover:text-blue-600 transition-colors">Rail Officer &amp; Admin</h4>
                                        <p className="text-lg text-slate-500 mt-1">Tracks Rake availability and Dispatch plans, or access the full "God View" of the entire network.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Image */}
                        <div className="relative">
                            <div className="absolute -inset-4 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-3xl blur-2xl opacity-50"></div>
                            <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop" alt="Analytics Dashboard" className="relative rounded-2xl shadow-2xl border border-slate-200 w-full" />

                            {/* Floating Stat Card */}
                            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-xl border border-slate-100 max-w-xs">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-green-100 rounded-lg text-green-600">
                                        <TrendingUp className="w-5 h-5" />
                                    </div>
                                    <span className="text-sm font-medium text-slate-500">Demurrage Savings</span>
                                </div>
                                <div className="text-3xl font-medium text-slate-900">$1.2M <span className="text-sm font-normal text-green-600">+12%</span></div>
                                <div className="w-full bg-slate-100 h-1.5 mt-3 rounded-full overflow-hidden">
                                    <div className="bg-green-500 h-full w-[75%] rounded-full"></div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* Grid Section: Integrated Planning & Finance */}
            <section className="py-24 px-6 max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-medium tracking-tight text-slate-900 mb-4">Unified Operations &amp; Finance</h2>
                    <p className="text-xl text-slate-500 max-w-2xl mx-auto">Breaking down silos between Port, Rail, and Finance for a seamless supply chain.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

                    {/* Feature 1 */}
                    <div className="bg-white p-8 rounded-2xl border border-slate-200">
                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                            <Network className="w-5 h-5 text-slate-700" />
                        </div>
                        <h3 className="text-xl font-medium text-slate-900 mb-2">Unified Planning Interface</h3>
                        <p className="text-lg text-slate-500">A single interface to manage vessel berths and crane allocation while seamlessly connecting to railway dispatch systems.</p>
                    </div>

                    {/* Feature 2 */}
                    <div className="bg-white p-8 rounded-2xl border border-slate-200">
                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                            <TrainFront className="w-5 h-5 text-slate-700" />
                        </div>
                        <h3 className="text-xl font-medium text-slate-900 mb-2">Seamless Rail Connect</h3>
                        <p className="text-lg text-slate-500">Ensure rakes are ready exactly when the ship docks. Eliminate idle time and synchronization errors between modes.</p>
                    </div>

                    {/* Feature 3 */}
                    <div className="bg-white p-8 rounded-2xl border border-slate-200">
                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                            <Calculator className="w-5 h-5 text-slate-700" />
                        </div>
                        <h3 className="text-xl font-medium text-slate-900 mb-2">Real-time Cost Calculus</h3>
                        <p className="text-lg text-slate-500">Every operational decision triggers an immediate financial calculation. Compare cost impacts of diverting to Paradip vs. waiting.</p>
                    </div>
                </div>

                <div className="mt-16 text-center">
                    <button className="bg-slate-900 hover:bg-slate-800 text-white text-lg font-medium px-8 py-3.5 rounded-full transition-all inline-flex items-center gap-2">
                        <Layers className="w-5 h-5" />
                        View Full Capabilities
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-blue-600 text-white pt-20 pb-10">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                        <div className="col-span-1 md:col-span-1">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-white">
                                    <Anchor className="w-5 h-5" />
                                </div>
                                <span className="text-xl font-medium tracking-tight">Sail logistics</span>
                            </div>
                            <p className="text-blue-100 text-lg leading-relaxed">
                                Revolutionizing steel logistics with digital twins, AI predictions, and automated self-healing supply chains.
                            </p>
                        </div>

                        <div>
                            <h4 className="text-white font-medium mb-6">Platform</h4>
                            <ul className="space-y-4 text-blue-100 text-lg">
                                <li><a href="#" className="hover:text-white transition-colors">Control Tower</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Port Planning</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Rail Dispatch</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Financial Intel</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-white font-medium mb-6">Company</h4>
                            <ul className="space-y-4 text-blue-100 text-lg">
                                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-white font-medium mb-6">Contact</h4>
                            <p className="text-blue-100 text-lg mb-2">Head Office: 123 Steel Executive Way</p>
                            <p className="text-blue-100 text-lg mb-2">Email: support@steelorchestra.com</p>
                            <div className="flex gap-4 mt-6">
                                <a href="#" className="text-blue-200 hover:text-white transition-colors"><Twitter className="w-5 h-5" /></a>
                                <a href="#" className="text-blue-200 hover:text-white transition-colors"><Linkedin className="w-5 h-5" /></a>
                                <a href="#" className="text-blue-200 hover:text-white transition-colors"><Facebook className="w-5 h-5" /></a>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-blue-500/50 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-blue-200 text-sm">© 2024 SteelOrchestra Digital Twin. All rights reserved.</p>
                        <div className="flex gap-6 text-blue-200 text-sm">
                            <a href="#" className="hover:text-white">Privacy Policy</a>
                            <a href="#" className="hover:text-white">Terms of Service</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
