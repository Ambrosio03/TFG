import React from 'react';
import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
  return (
    <Link to={`/product/${product.id}`} className="block h-full">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden h-full flex flex-col">
        <div className="flex justify-center items-center p-4" style={{ height: '200px' }}>
          <img 
            src={`/images/${product.imagen}`} 
            alt={product.nombre} 
            className="object-contain w-full h-full" 
          />
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