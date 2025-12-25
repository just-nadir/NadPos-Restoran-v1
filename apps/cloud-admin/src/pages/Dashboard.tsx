import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, LogOut, Loader2 } from 'lucide-react';
import api from '../lib/api';

interface Restaurant {
    id: string;
    name: string;
    licenseKey: string;
}

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRestaurants();
    }, []);

    const fetchRestaurants = async () => {
        try {
            const response = await api.get('/admin/restaurants');
            setRestaurants(response.data);
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('isAuthenticated');
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-sm p-4 flex justify-between items-center">
                <h1 className="text-xl font-bold text-gray-800">Cloud Admin Panel</h1>
                <button onClick={handleLogout} className="flex items-center text-gray-600 hover:text-red-600">
                    <LogOut className="w-5 h-5 mr-1" /> Logout
                </button>
            </nav>
            <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
                    <button
                        onClick={() => navigate('/create-restaurant')}
                        className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                        <PlusCircle className="w-5 h-5 mr-2" /> Add Restaurant
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="bg-white overflow-hidden shadow rounded-lg p-6">
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Restaurants</dt>
                        <dd className="mt-1 text-3xl font-semibold text-gray-900">{restaurants.length}</dd>
                    </div>
                </div>

                <div className="mt-8">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Tenants</h3>
                    <div className="bg-white shadow overflow-hidden sm:rounded-md">
                        {loading ? (
                            <div className="flex justify-center py-10">
                                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                            </div>
                        ) : (
                            <ul className="divide-y divide-gray-200">
                                {restaurants.map((res) => (
                                    <li key={res.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium text-blue-600 truncate">{res.name}</p>
                                            <div className="ml-2 flex-shrink-0 flex">
                                                <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Active</p>
                                            </div>
                                        </div>
                                        <div className="mt-2 sm:flex sm:justify-between">
                                            <div className="sm:flex flex-col">
                                                <p className="flex items-center text-sm text-gray-500">
                                                    ID: {res.id}
                                                </p>
                                                <p className="flex items-center text-xs text-gray-400 mt-1">
                                                    Key: {res.licenseKey}
                                                </p>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                                {restaurants.length === 0 && (
                                    <li className="px-4 py-10 text-center text-gray-500">
                                        Restoranlar topilmadi. Qo'shish uchun yuqoridagi tugmani bosing.
                                    </li>
                                )}
                            </ul>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
