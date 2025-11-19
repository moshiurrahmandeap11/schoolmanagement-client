import { useEffect, useState } from 'react';
import { FaCalendarAlt, FaEdit, FaMapMarkerAlt, FaPlus, FaTrash } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axiosInstance, { baseImageURL } from '../../../../../../../hooks/axiosInstance/axiosInstance';
import Loader from '../../../../../../sharedItems/Loader/Loader';
import MainButton from '../../../../../../sharedItems/Mainbutton/Mainbutton';
import AddNewEvents from './AddNewEvents/AddNewEvents';


const Events = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('list'); // 'list' or 'new'
    const [editingEvent, setEditingEvent] = useState(null);

    // Fetch events
    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/events');
            
            if (response.data.success) {
                setEvents(response.data.data);
            } else {
                showSweetAlert('error', response.data.message || 'Failed to load events');
            }
        } catch (error) {
            console.error('Error fetching events:', error);
            showSweetAlert('error', 'Failed to load events: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const showSweetAlert = (icon, title, text = '') => {
        Swal.fire({
            icon,
            title,
            text,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
        });
    };

    const handleAddNew = () => {
        setEditingEvent(null);
        setActiveTab('new');
    };

    const handleEdit = (event) => {
        setEditingEvent(event);
        setActiveTab('new');
    };

    const handleDelete = async (eventId) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel'
        });

        if (result.isConfirmed) {
            try {
                setLoading(true);
                const response = await axiosInstance.delete(`/events/${eventId}`);

                if (response.data.success) {
                    showSweetAlert('success', 'Event deleted successfully!');
                    fetchEvents();
                } else {
                    showSweetAlert('error', response.data.message || 'Failed to delete event');
                }
            } catch (error) {
                console.error('Error deleting event:', error);
                const errorMessage = error.response?.data?.message || 'Failed to delete event';
                showSweetAlert('error', errorMessage);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleBack = () => {
        setActiveTab('list');
        setEditingEvent(null);
        fetchEvents();
    };

    // Format date for display
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-BD', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Get status badge color
    const getStatusColor = (status) => {
        switch (status) {
            case 'Published':
                return 'bg-[#1e90c9] text-white';
            case 'Draft':
                return 'bg-yellow-100 text-yellow-800';
            case 'Expired':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // If activeTab is 'new', show AddNewEvents component
    if (activeTab === 'new') {
        return (
            <AddNewEvents 
                editingEvent={editingEvent}
                onBack={handleBack}
            />
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Main Content */}
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-full mx-auto">
                    {/* Header Section */}
                    <div className="text-center mb-10">
                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-3">
                            ইভেন্ট ব্যবস্থাপনা
                        </h1>
                    </div>

                    {/* Add New Button */}
                    <div className="flex justify-end mb-6">
                        <MainButton
                            onClick={handleAddNew}
                        >
                            <FaPlus />
                            নতুন ইভেন্ট
                        </MainButton>
                    </div>

                    {/* Events List */}
                    <div className="bg-white rounded-lg shadow-lg border border-gray-200">
                        {/* Loading State */}
                        {loading && (
                            <Loader></Loader>
                        )}

                        {/* Empty State */}
                        {!loading && events.length === 0 && (
                            <div className="p-8 text-center">
                                <div className="text-6xl mb-4">🎉</div>
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">No Events Found</h3>
                                <p className="text-gray-600 mb-4">Get started by adding your first event.</p>
                                <MainButton
                                    onClick={handleAddNew}
                                >
                                    Add Event
                                </MainButton>
                            </div>
                        )}

                        {/* Events Table */}
                        {!loading && events.length > 0 && (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">নাম</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">তারিখ</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">অবস্থান</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">এডিট / ডিলিট</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {events.map((event) => (
                                            <tr key={event._id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-start gap-3">
                                                        {event.images && event.images.length > 0 && (
                                                            <img 
                                                                src={`${baseImageURL}${event.images[0]}`}
                                                                alt={event.name}
                                                                className="w-12 h-12 rounded-lg object-cover border"
                                                            />
                                                        )}
                                                        <div>
                                                            <p className="font-medium text-gray-800">{event.name}</p>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(event.status)}`}>
                                                                    {event.status}
                                                                </span>
                                                                {event.startTime && (
                                                                    <span className="text-xs text-gray-500">
                                                                        {event.startTime} - {event.endTime}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <FaCalendarAlt className="text-gray-400" />
                                                        {formatDate(event.date)}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <FaMapMarkerAlt className="text-gray-400" />
                                                        {event.address || 'N/A'}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleEdit(event)}
                                                            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm flex items-center gap-1"
                                                        >
                                                            <FaEdit className="text-xs" />
                                                            এডিট
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(event._id)}
                                                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm flex items-center gap-1"
                                                        >
                                                            <FaTrash className="text-xs" />
                                                            ডিলিট
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Summary */}
                    {events.length > 0 && (
                        <div className="mt-4 text-sm text-gray-600">
                            <div className="flex flex-wrap gap-4">
                                <span>Total Events: {events.length}</span>
                                <span>Published: {events.filter(e => e.status === 'Published').length}</span>
                                <span>Draft: {events.filter(e => e.status === 'Draft').length}</span>
                                <span>Expired: {events.filter(e => e.status === 'Expired').length}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Events;