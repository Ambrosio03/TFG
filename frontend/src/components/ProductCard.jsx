import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const totalImages = product.imagenes && product.imagenes.length;

  const handlePrev = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedImage((prev) => (prev === 0 ? totalImages - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedImage((prev) => (prev === totalImages - 1 ? 0 : prev + 1));
  };

  return (
    <Link to={`/product/${product.id}`} className="block h-full">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden h-full flex flex-col">
        <div className="flex justify-center items-center p-4 relative" style={{ height: '200px' }}>
          {totalImages > 0 ? (
            <>
              <img
                className="object-cover w-full h-full rounded-lg"
                src={`http://localhost:8000/images/products/${product.imagenes[selectedImage]}`}
                alt={product.nombre}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/placeholder.png';
                }}
              />
              {totalImages > 1 && (
                <>
                  <button
                    onClick={handlePrev}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-70 rounded-full p-1 shadow hover:bg-gray-200"
                  >
                    <svg className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={handleNext}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-70 rounded-full p-1 shadow hover:bg-gray-200"
                  >
                    <svg className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                {product.imagenes.map((_, idx) => (
                  <span
                    key={idx}
                    className={`inline-block w-2 h-2 rounded-full ${selectedImage === idx ? 'bg-indigo-600' : 'bg-gray-300'}`}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center w-full h-full text-gray-400 italic">
              Sin imagen
            </div>
          )}
        </div>
        <div className="p-4 flex-grow">
          <h2 className="text-xl font-bold mb-2 line-clamp-2">{product.nombre}</h2>
          <p className="text-gray-700 mb-2 line-clamp-3">{product.descripcion}</p>
          <p className="text-green-500 font-semibold mb-2">Precio: {product.precio}€</p>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard; 