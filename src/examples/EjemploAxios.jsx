import React,  {useState, useEffect, useCallback} from 'react';
import { RecursosService } from '../services/recursosService';

export const EjemploAxios = () => {

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cargarDatos = useCallback( async () => {

    try {
      setLoading(true);
      const result = await RecursosService.getRecursos();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err.message || 'Fallo de comunicación con el API');
    } finally {
      setLoading(false);
    }


  }, []);

  useEffect(() => {
    cargarDatos();

  }, [cargarDatos]);


  return (

    <div style={{ padding: '1rem', border: '1px solid #ccc', borderRadius: '8px'}} >
      <h3>Lista de Recursos (Servicio centralizado con Axios)</h3>
      <button onClick={cargarDatos} disabled={loading} className="mt-4 inline-block rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700" > 
        { loading ? 'Procesando ...' : 'Recargar / Refrescar Datos' }  
      </button>

      { loading && <p>Cargando información de la red ...</p>}
      { error&& <p style={{color: 'red'}} >Mensaje de Error: {error}</p> }

      { !loading && !error && (
          <ul>
            { data.slice(0, 5).map( (item) => (
                <li key={item.id} >
                  <strong>{item.title}</strong> <br />
                  <p> {item.body} </p>
                  
              </li>
            ))
            }
            
          </ul>


        )}

    </div>
  )
};

export default EjemploAxios;