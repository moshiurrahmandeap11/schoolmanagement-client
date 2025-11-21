import { useEffect, useState } from 'react';
import axiosInstance from '../../../../../hooks/axiosInstance/axiosInstance';
import MainButton from '../../../../sharedItems/Mainbutton/Mainbutton';
import RichTextEditor from '../../../../sharedItems/RichTextEditor/RichTextEditor';

const AdmissionInfoAdmin = () => {
    const [content, setContent] = useState('');
    const [existingData, setExistingData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Fetch existing admission info
    useEffect(() => {
        fetchAdmissionInfo();
    }, []);

    const fetchAdmissionInfo = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/admission-info');
            
            if (response.data.success && response.data.data) {
                setExistingData(response.data.data);
                setContent(response.data.data.content);
            }
        } catch (error) {
            console.error('Error fetching admission info:', error);
            const errorMessage = error.response?.data?.message || 'Failed to load admission information';
            showMessage('error', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    };

    const handleSave = async () => {
        if (!content.trim()) {
            showMessage('error', 'Please enter admission information content');
            return;
        }

        try {
            setLoading(true);
            const response = await axiosInstance.post('/admission-info', { content });

            if (response.data.success) {
                showMessage('success', 
                    existingData 
                        ? 'Admission information updated successfully!' 
                        : 'Admission information created successfully!'
                );
                setExistingData(response.data.data);
            } else {
                showMessage('error', response.data.message || 'Failed to save admission information');
            }
        } catch (error) {
            console.error('Error saving admission info:', error);
            const errorMessage = error.response?.data?.message || 'Failed to save admission information';
            showMessage('error', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete the admission information? This action cannot be undone.')) {
            return;
        }

        try {
            setLoading(true);
            const response = await axiosInstance.delete('/admission-info');

            if (response.data.success) {
                showMessage('success', 'Admission information deleted successfully!');
                setExistingData(null);
                setContent('');
            } else {
                showMessage('error', response.data.message || 'Failed to delete admission information');
            }
        } catch (error) {
            console.error('Error deleting admission info:', error);
            const errorMessage = error.response?.data?.message || 'Failed to delete admission information';
            showMessage('error', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setContent('');
    };

    return (
        <div className="max-w-full mx-auto p-6 bg-white rounded-lg shadow-lg">
            <div className="mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                    Admission Information Management
                </h1>
            </div>

            {/* Message Display */}
            {message.text && (
                <div className={`mb-6 p-4 rounded-lg ${
                    message.type === 'success' 
                        ? 'bg-green-50 border border-green-200 text-green-700' 
                        : 'bg-red-50 border border-red-200 text-red-700'
                }`}>
                    {message.text}
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mr-3"></div>
                        <span className="text-blue-700">Processing...</span>
                    </div>
                </div>
            )}

            {/* Rich Text Editor */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Admission Information Content *
                </label>
                <RichTextEditor
                    value={content}
                    onChange={setContent}
                    placeholder="Enter admission information details, requirements, process, deadlines, etc..."
                />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 justify-end">
                {/* Clear Button */}
                <button
                    type="button"
                    onClick={handleClear}
                    disabled={loading || !content.trim()}
                    className="px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                    Clear
                </button>

                {/* Delete Button - Only show if data exists */}
                {existingData && (
                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={loading}
                        className="px-4 sm:px-6 py-2 sm:py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                        {loading ? 'Deleting...' : 'Delete'}
                    </button>
                )}

                {/* Save/Update Button */}
                <MainButton
                    type="button"
                    onClick={handleSave}
                    disabled={loading || !content.trim()}
                    className="rounded-md"
                >
                    {loading 
                        ? 'Saving...' 
                        : existingData 
                            ? 'Update Admission Info' 
                            : 'Create Admission Info'
                    }
                </MainButton>
            </div>

            {/* Status Info */}
            <div className="mt-6 p-4 bg-blue-50  rounded-lg">
                <h3 className="font-semibold text-[#1e90c9] mb-2">Information:</h3>
                <ul className="text-[#1e90c9] text-sm space-y-1">
                    <li>• Admission information can only be created once</li>
                    <li>• After creation, you can edit or delete the content</li>
                    <li>• Use the rich text editor to format your content properly</li>
                    <li>• Links will open in new tabs automatically</li>
                </ul>
            </div>

            {/* Preview Section */}
            {content && (
                <div className="mt-8">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Preview:</h3>
                    <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                        <div 
                            className="prose max-w-none"
                            dangerouslySetInnerHTML={{ __html: content }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdmissionInfoAdmin;