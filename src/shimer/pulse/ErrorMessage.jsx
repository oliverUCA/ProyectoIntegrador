import React from 'react';

export const ErrorMessage = ({ errorDetail, onRetry }) => {
    return (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 my-6 rounded-r-md shadow-sm">
            <div className='flex items-start'>
                <div className='flex-shrink-0 ' >
                    <svg className="h-6 w-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <div className='ml-3 flex-1'>
                    <h3 className='text-base font-medium text-gray-900' >Error al cargar los productos</h3>
                    <p className='text-sm text-gray-600 mt-1' >
                        {errorDetail || "No se pudo establecer conexion con el servidor"}</p>
                    {onRetry && (
                        <div className='mt-3'>
                            <button type="button" onClick={onRetry} className='inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-semibold rounded bg-red-100 text-red-800 hover:bg-red-200 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2' >
                                Reintentar Petición</button>
                        </div>
                    )}


                </div>
            </div>

        </div>

    );
};
export default ErrorMessage;