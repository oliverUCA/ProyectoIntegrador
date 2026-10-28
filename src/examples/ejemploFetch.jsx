import React, { useState, useEffect } from 'react';

export const EjemploFetch = () => {

  const [data, setData] = useState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://jsonplaceholder.typicode.com/posts');
        if(!response.ok) {
          throw new Error(`Error de red HTTP: ${response.status} - ${response.statusText}`);
        }

        const result = await response.json();
        setData(result);
        setError(null);
      } catch(err) {

        setError(err.message || 'Error desconocido al consultar al servidor');
 
      } finally {
        setLoading(false);

      }
    };

    fetchData();

  }, [] );

  if(loading) return <p>Cargando datos con Fetch API Nativo ....</p>;
  if(error) return <p style={{ color: 'red' }}> Error: {error}  </p>;

  return (

    <div>
      <h3 className='text-3xl font-bold mb-2 text-gray-900'> Consulta con Fetch API </h3>
      <ul>
        {data.slice(0, 5).map((item) => (
         <li key={item.id} > {item.title} </li> 
        ))}
      </ul>
    </div>

  );

};