import image from "../../../public/govtimage.jpg";

const GovtImage = () => {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-3 sm:p-4">
                <img 
                    src={image} 
                    alt="গভর্নমেন্ট হটলাইন"
                    className="w-full h-auto rounded-md sm:rounded-lg object-contain max-w-full border border-gray-100"
                />
            </div>
        </div>
    );
};

export default GovtImage;