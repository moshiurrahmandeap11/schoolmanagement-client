import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import axiosInstance, { baseImageURL } from '../../../../../hooks/axiosInstance/axiosInstance';
import Loader from '../../../../sharedItems/Loader/Loader';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('banner');
  const [banners, setBanners] = useState([]);
  const [sliders, setSliders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [newBanner, setNewBanner] = useState({
    title: '',
    image: null,
    link: '',
    isActive: true
  });

  const [newSlider, setNewSlider] = useState({
    title: '',
    images: [],
    autoPlay: true,
    speed: 3000
  });

  // SweetAlert2 configuration
  const showAlert = (icon, title, text = '') => {
    Swal.fire({
      icon,
      title,
      text,
      timer: 3000,
      showConfirmButton: false,
      position: 'top-end',
      toast: true,
      background: '#1f2937',
      color: '#fff'
    });
  };

  // Fetch data
  useEffect(() => {
    fetchBanners();
    fetchSliders();
  }, []);

  // Banner Functions
  const fetchBanners = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/banners');
      setBanners(response.data.data);
    } catch  {
      showAlert('error', 'Failed to load banners');
    } finally {
      setLoading(false);
    }
  };

  const baseImageUrl = baseImageURL;

  const handleBannerImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showAlert('error', 'Only image files are allowed');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        showAlert('error', 'File size must be less than 5MB');
        return;
      }

      setNewBanner({ ...newBanner, image: file });
    }
  };

  const handleAddBanner = async () => {
    if (!newBanner.title || !newBanner.image) {
      showAlert('warning', 'Title and image file are required');
      return;
    }

    try {
      setUploading(true);
      
      const formData = new FormData();
      formData.append('title', newBanner.title);
      formData.append('image', newBanner.image);
      formData.append('link', newBanner.link);
      formData.append('isActive', newBanner.isActive.toString());

      const response = await axiosInstance.post('/banners', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setBanners([...banners, response.data.data]);
      setNewBanner({ title: '', image: null, link: '', isActive: true });
      
      const fileInput = document.getElementById('banner-image');
      if (fileInput) fileInput.value = '';
      
      showAlert('success', 'Banner created successfully');
    } catch (error) {
      showAlert('error', error.response?.data?.message || 'Failed to create banner');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteBanner = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      background: '#1f2937',
      color: '#fff'
    });

    if (!result.isConfirmed) return;

    try {
      setLoading(true);
      await axiosInstance.delete(`/banners/${id}`);
      setBanners(banners.filter(banner => banner._id !== id));
      showAlert('success', 'Banner deleted successfully');
    } catch (error) {
      showAlert('error', error.response?.data?.message || 'Failed to delete banner');
    } finally {
      setLoading(false);
    }
  };

  const toggleBannerStatus = async (id) => {
    try {
      const response = await axiosInstance.patch(`/banners/${id}/toggle`);
      setBanners(banners.map(banner => 
        banner._id === id ? { ...banner, isActive: response.data.data.isActive } : banner
      ));
      showAlert('success', response.data.message);
    } catch (error) {
      showAlert('error', error.response?.data?.message || 'Failed to update status');
    }
  };

  // Slider Functions
  const fetchSliders = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/sliders');
      setSliders(response.data.data);
    } catch  {
      showAlert('error', 'Failed to load sliders');
    } finally {
      setLoading(false);
    }
  };

  const handleSliderImagesChange = (e) => {
    const files = Array.from(e.target.files);
    
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        showAlert('error', 'Only image files are allowed');
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        showAlert('error', 'Each file must be less than 5MB');
        return false;
      }
      return true;
    });

    setNewSlider({ ...newSlider, images: validFiles });
  };

  const handleAddSlider = async () => {
    if (!newSlider.title || newSlider.images.length === 0) {
      showAlert('warning', 'Title and at least one image file are required');
      return;
    }

    try {
      setUploading(true);
      
      const formData = new FormData();
      formData.append('title', newSlider.title);
      formData.append('autoPlay', newSlider.autoPlay.toString());
      formData.append('speed', newSlider.speed.toString());
      
      newSlider.images.forEach((image) => {
        formData.append('images', image);
      });

      const response = await axiosInstance.post('/sliders', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSliders([...sliders, response.data.data]);
      setNewSlider({ title: '', images: [], autoPlay: true, speed: 3000 });
      
      const fileInput = document.getElementById('slider-images');
      if (fileInput) fileInput.value = '';
      
      showAlert('success', 'Slider created successfully');
    } catch (error) {
      showAlert('error', error.response?.data?.message || 'Failed to create slider');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteSlider = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      background: '#1f2937',
      color: '#fff'
    });

    if (!result.isConfirmed) return;

    try {
      setLoading(true);
      await axiosInstance.delete(`/sliders/${id}`);
      setSliders(sliders.filter(slider => slider._id !== id));
      showAlert('success', 'Slider deleted successfully');
    } catch (error) {
      showAlert('error', error.response?.data?.message || 'Failed to delete slider');
    } finally {
      setLoading(false);
    }
  };

  const toggleSliderAutoPlay = async (id) => {
    try {
      const response = await axiosInstance.patch(`/sliders/${id}/toggle-autoplay`);
      setSliders(sliders.map(slider => 
        slider._id === id ? { ...slider, autoPlay: response.data.data.autoPlay } : slider
      ));
      showAlert('success', response.data.message);
    } catch (error) {
      showAlert('error', error.response?.data?.message || 'Failed to toggle autoplay');
    }
  };

  const removeSliderImage = (index) => {
    const newImages = newSlider.images.filter((_, i) => i !== index);
    setNewSlider({ ...newSlider, images: newImages });
  };

  const getImageUrl = (imagePath) => {
    if (imagePath.startsWith('http')) return imagePath;
    return `${baseImageUrl}${imagePath}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 lg:p-6">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-black bg-clip-text text-transparent">
            Settings Dashboard
          </h1>
          <p className="text-gray-600 mt-2 text-lg">Manage banners and sliders with ease</p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 mb-8">
          <div className="flex border-b border-gray-200">
            <button
              className={`flex-1 py-5 px-6 text-center font-semibold transition-all duration-300 ${
                activeTab === 'banner'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-blue-500 hover:bg-gray-50'
              }`}
              onClick={() => setActiveTab('banner')}
            >
              <div className="flex items-center justify-center gap-2">
                <span>Banner Management</span>
              </div>
            </button>
            <button
              className={`flex-1 py-5 px-6 text-center font-semibold transition-all duration-300 ${
                activeTab === 'slider'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-blue-500 hover:bg-gray-50'
              }`}
              onClick={() => setActiveTab('slider')}
            >
              <div className="flex items-center justify-center gap-2">
                <span>Slider Management</span>
              </div>
            </button>
          </div>
        </div>

        {/* Loading Spinner */}
        {(loading || uploading) && (
          <div className="flex justify-center items-center py-12">
            {/* <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin"></div>
              <div className="w-16 h-16 border-4 border-blue-600 rounded-full animate-spin absolute top-0 left-0 border-t-transparent"></div>
            </div> */}
            <Loader></Loader>
          </div>
        )}

        {/* Banner Management */}
        {activeTab === 'banner' && !loading && (
          <div className="space-y-8">
            {/* Add New Banner Form */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
                <h3 className="text-2xl font-bold text-gray-800">Create New Banner</h3>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
                <div className="lg:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Banner Title *</label>
                  <input
                    type="text"
                    value={newBanner.title}
                    onChange={(e) => setNewBanner({...newBanner, title: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter banner title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Image File *</label>
                  <div className="relative">
                    <input
                      id="banner-image"
                      type="file"
                      accept="image/*"
                      onChange={handleBannerImageChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all"
                    />
                  </div>
                  {newBanner.image && (
                    <p className="text-sm text-green-600 mt-2 font-medium">
                       {newBanner.image.name}
                    </p>
                  )}
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleAddBanner}
                    disabled={uploading}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl"
                  >
                    {uploading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Uploading...</span>
                      </div>
                    ) : (
                      'Create Banner'
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Banner List */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-gray-800">All Banners</h3>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                    {banners.length} items
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                {banners.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 mx-auto mb-4 text-gray-400">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-gray-500 text-lg">No banners created yet</p>
                    <p className="text-gray-400">Create your first banner to get started</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {banners.map((banner) => (
                      <div key={banner._id} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 bg-white">
                        <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
                          {banner.image ? (
                            <img 
                              src={getImageUrl(banner.image)} 
                              alt={banner.title}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                e.target.src = 'https://i.postimg.cc/jSHNHxKr/images.jpg';
                              }}
                            />
                          ) : (
                            <div className="text-gray-400 text-center">
                              <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span>No Image</span>
                            </div>
                          )}
                          <div className="absolute top-3 right-3">
                            <button
                              onClick={() => toggleBannerStatus(banner._id)}
                              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                                banner.isActive
                                  ? 'bg-green-500 text-white shadow-lg'
                                  : 'bg-red-500 text-white shadow-lg'
                              }`}
                            >
                              {banner.isActive ? 'Active' : 'Inactive'}
                            </button>
                          </div>
                        </div>
                        <div className="p-4">
                          <h4 className="font-bold text-gray-800 mb-2 text-lg">{banner.title}</h4>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">
                              
                            </span>
                            <button
                              onClick={() => handleDeleteBanner(banner._id)}
                              disabled={loading}
                              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 font-semibold text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Slider Management */}
        {activeTab === 'slider' && !loading && (
          <div className="space-y-8">
            {/* Add New Slider Form */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
                <h3 className="text-2xl font-bold text-gray-800">Create New Slider</h3>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Slider Name *</label>
                    <input
                      type="text"
                      value={newSlider.title}
                      onChange={(e) => setNewSlider({...newSlider, title: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Enter slider name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Slide Speed (ms) *</label>
                    <input
                      type="number"
                      value={newSlider.speed}
                      onChange={(e) => setNewSlider({...newSlider, speed: parseInt(e.target.value) || 3000})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="3000"
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={newSlider.autoPlay}
                        onChange={(e) => setNewSlider({...newSlider, autoPlay: e.target.checked})}
                        className="sr-only"
                      />
                      <div className={`w-12 h-6 rounded-full transition-all duration-300 ${
                        newSlider.autoPlay ? 'bg-blue-600' : 'bg-gray-300'
                      }`}>
                        <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ${
                          newSlider.autoPlay ? 'transform translate-x-6' : ''
                        }`}></div>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-gray-700">Auto Play</span>
                  </label>
                </div>

                {/* Slider Images */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Slider Images *</label>
                  <input
                    id="slider-images"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleSliderImagesChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-blue-700 hover:file:bg-purple-100 transition-all"
                  />
                  {newSlider.images.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-semibold text-gray-600 mb-3">Selected Files:</p>
                      <div className="space-y-2">
                        {newSlider.images.map((image, index) => (
                          <div key={index} className="flex items-center justify-between bg-gradient-to-r from-purple-50 to-blue-50 p-3 rounded-lg border border-purple-100">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                <span className="text-blue-600 text-sm">📷</span>
                              </div>
                              <span className="text-sm font-medium text-gray-700">{image.name}</span>
                            </div>
                            <button
                              onClick={() => removeSliderImage(index)}
                              className="w-8 h-8 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all duration-200 flex items-center justify-center"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleAddSlider}
                  disabled={uploading}
                  className="w-full bg-blue-600 text-white py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg shadow-lg hover:shadow-xl"
                >
                  {uploading ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Creating Slider...</span>
                    </div>
                  ) : (
                    'Create Slider'
                  )}
                </button>
              </div>
            </div>

            {/* Slider List */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-gray-800">All Sliders</h3>
                  <span className="bg-purple-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                    {sliders.length} items
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                {sliders.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 mx-auto mb-4 text-gray-400">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                      </svg>
                    </div>
                    <p className="text-gray-500 text-lg">No sliders created yet</p>
                    <p className="text-gray-400">Create your first slider to get started</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {sliders.map((slider) => (
                      <div key={slider._id} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 bg-white">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
                          <div>
                            <h4 className="text-xl font-bold text-gray-800 mb-2">{slider.title}</h4>
                            <div className="flex flex-wrap gap-3">
                              <button
                                onClick={() => toggleSliderAutoPlay(slider._id)}
                                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                                  slider.autoPlay 
                                    ? 'bg-green-500 text-white shadow-lg hover:bg-green-600' 
                                    : 'bg-gray-500 text-white shadow-lg hover:bg-gray-600'
                                }`}
                              >
                                Auto Play: {slider.autoPlay ? 'ON' : 'OFF'}
                              </button>
                              <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                                Speed: {slider.speed}ms
                              </span>
                              <span className="px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-semibold">
                                Images: {slider.images.length}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteSlider(slider._id)}
                            disabled={loading}
                            className="mt-4 lg:mt-0 px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 font-semibold shadow-lg hover:shadow-xl"
                          >
                            Delete Slider
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {slider.images.map((image, index) => (
                            <div key={index} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-all duration-300">
                              <div className="h-32 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                {image.path ? (
                                  <img 
                                    src={getImageUrl(image.path)} 
                                    alt={`Slide ${index + 1}`}
                                    className="h-full w-full object-cover"
                                    onError={(e) => {
                                      e.target.src = 'https://via.placeholder.com/300x150?text=Image+Not+Found';
                                    }}
                                  />
                                ) : (
                                  <div className="text-gray-400 text-center">
                                    <svg className="w-8 h-8 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span className="text-xs">No Image</span>
                                  </div>
                                )}
                              </div>
                              <div className="p-3 bg-gray-50">
                                <p className="text-sm text-gray-600 truncate font-medium">
                                  {image.originalName || 'Untitled Image'}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;