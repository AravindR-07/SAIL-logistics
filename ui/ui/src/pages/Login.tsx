
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Shield,
    User,
    Lock,
    ArrowRight,
    Building2,
    Anchor,
    Train,
    Factory,
    Banknote,
    BrainCircuit,
    Settings,
    Eye,
    EyeOff,
    ChevronDown,
    ArrowLeft
} from 'lucide-react';

const ROLES = [
    { id: 'corporate', label: 'Corporate Logistics', icon: Building2 },
    { id: 'port_manager', label: 'Port Manager', icon: Anchor },
    { id: 'railway_officer', label: 'Railway Officer', icon: Train },
    { id: 'plant_head', label: 'Plant Head', icon: Factory },
    { id: 'finance', label: 'Finance', icon: Banknote },
    { id: 'ai_analyst', label: 'AI Analyst', icon: BrainCircuit },
    { id: 'admin', label: 'System Admin', icon: Settings },
];

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [selectedRole, setSelectedRole] = useState<string>(ROLES[0].id);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:8000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            login(data.token, data.user);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Find the icon for the currently selected role to display in the input
    const CurrentRoleIcon = ROLES.find(r => r.id === selectedRole)?.icon || User;

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-4 relative">
            {/* Back to Home Button */}
            <button
                onClick={() => navigate('/')}
                className="absolute top-6 left-6 text-black hover:text-white flex items-center gap-2 transition-colors group"
            >
                <div className="p-2 rounded-full bg-blue-600 text-white border border-white  transition-all">
                    <ArrowLeft size={20} />
                </div>
                {/* <span className="font-medium text-sm bg-gray-300 p-2 hover:bg-black rounded-full ">Back to Home</span> */}
            </button>
            <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-2xl">
                <div className="flex justify-center mb-8">
                    <div className="bg-blue-600 p-4 rounded-full">
                        <img src="/assets/logo.png" alt="Logo" className="w-8 h-8 pt-1 object-contain" />
                    </div>
                </div>

                <h2 className="text-3xl font-bold text-black text-center mb-2">SAIL Logistics</h2>
                <p className="text-black text-center mb-8">Secure Access Portal</p>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg mb-6 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* Role Dropdown */}
                    <div>
                        <label className="block text-black text-sm font-medium mb-2">Select Role</label>
                        <div className="relative">
                            <CurrentRoleIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-black pointer-events-none" />
                            <select
                                value={selectedRole}
                                onChange={(e) => setSelectedRole(e.target.value)}
                                className="w-full bg-white border-2 text-black pl-10 pr-10 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none cursor-pointer hover:bg-gray-100"
                            >
                                {ROLES.map((role) => (
                                    <option key={role.id} value={role.id}>
                                        {role.label}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
                        </div>
                    </div>

                    {/* Username */}
                    <div>
                        <label className="block text-slate-400 text-sm font-medium mb-2">Username</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => {
                                    // Force lowercase and remove any non-alphanumeric characters (no special chars allowed)
                                    const val = e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '');
                                    setUsername(val);
                                }}
                                className="w-full bg-white border-2 text-black pl-10 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                placeholder="Enter username"
                                required
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-slate-400 text-sm font-medium mb-2">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-white border-2 text-black pl-10 pr-12 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                placeholder="••••••••"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-black transition-colors"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95 mt-4 shadow-lg shadow-blue-900/20"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                Sign In <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
