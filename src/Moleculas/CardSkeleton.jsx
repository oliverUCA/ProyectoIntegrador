import React from 'react';

export const CardSkeleton = () => {

  return (
    <>
    
    <div className='bg-white border border-gray-200 reounded-lg p-4 shadow-sm animate-pulse flex flex-col justify-between' >
      <div>
        {/* Placeholder visual para la imagen del producto*/}
        <div className='w-full h-48 bg-gray-300 rounded-md mb-4' ></div>
        {/* Placeholder para el título */}
        <div className='h-6 bg-gray-300 rounded w-3/4 mb-3' ></div>
        {/* Placeholder para la descripciom */}
        <div className='h-4 bg-gray-200 rounded w-full mb-2 ' ></div>
        <div className='h-4 bg-gray-200 rounded w-5/6' ></div>
      </div>
      {/* {Placeholder para el boton de compra o acciones} */}
      <div className='mt-6 h-10 bg-gray-300 rounded-md w-full' ></div>

    </div>
    </>
  )
}
export default CardSkeleton;