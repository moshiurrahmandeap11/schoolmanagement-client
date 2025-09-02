import React from "react";

const Loader = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50">
      <div className="relative flex items-center justify-center">
        {/* Spinning Book Animation */}
        <div className="w-16 h-16 border-4 border-[#0F5EF6] border-t-transparent rounded-full animate-spin"></div>
        <div className="absolute text-[#0F5EF6] text-2xl font-bold">📖</div>
      </div>
      <p className="absolute mt-24 text-lg font-medium text-[#0F5EF6] animate-pulse">
        Loading BrightFuture...
      </p>
    </div>
  );
};

export default Loader;