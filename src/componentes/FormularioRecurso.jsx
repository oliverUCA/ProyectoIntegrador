import { useState, useEffect } from 'react';
import { useRecursos } from '../hooks/useRecursos';


export const FormularioRecurso = () => {

    const { agregarRecurso, modificarRecurso, recursoAEditar, cancelarEdicion, isSubmitting } = useRecursos();
    const [title, setTitle] = useState(''); const [body, setBody] = useState('');
    const [validacionError, setValidacionError] = useState('');
    const [mensajeExito, setMensajeExito] = useState('');

    //Efecto de recarga

    useEffect(() => {
        if (recursoAEditar) {
            setTitle(recursoAEditar.title || '');
            setBody(recursoAEditar.body || '');
            setValidacionError('');
        } else {
            setTitle('');
            setBody('');
        }

    }, [recursoAEditar]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setValidacionError('');
        setMensajeExito('');
        // Validaciones simples de presencia de texto 
        if (!title.trim() || !body.trim()) {
            setValidacionError('Todos los campos son estrictamente obligatorios.');
            return;
        }
        let exito;
        if (recursoAEditar) {
            // Flujo de Actualización (PUT) 
            exito = await modificarRecurso(recursoAEditar.id, { ...recursoAEditar, title, body, });
            if (exito) {
                setMensajeExito('¡Recurso actualizado correctamente!');
            }
        } else {
            // Flujo de Creación (POST) 
            exito = await agregarRecurso({ title, body, userId: 1 });
            if (exito) {
                setTitle('');
                setBody('');
                setMensajeExito('¡Recurso creado exitosamente!');
            }
        }
        if (exito) {
            setTimeout(() => setMensajeExito(''), 3000);
        }
    };



    return (

        <form onSubmit={handleSubmit} className='border border-gray-200 p-4 rounded-lg mb-4 bg-white space-y-3'>
            <h3>{recursoAEditar ? 'Editar Recurso Existente' : 'Crear Nuevo Recurso'}</h3>

            {validacionError && <p className='text-red-700'>{validacionError}</p>}
            {mensajeExito && <p className='text-green-700 font-medium'>{mensajeExito}</p>}

            <div className='flex flex-col gap-1'>
                <label htmlFor="title" className='font-semibold'>Título:</label>
                <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={isSubmitting}
                    placeholder="Ej. Conceptos de Inmutabilidad"
                    className='border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
            </div>

            <div className='flex flex-col gap-1'>
                <label htmlFor="body" className='font-semibold'>Contenido:</label>
                <textarea
                    id="body"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    disabled={isSubmitting}
                    placeholder="Ej. Descripción detallada del recurso..."
                    rows={3}
                    className='border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
            </div>

            <div className='flex gap-2'>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className='rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60'
                >
                    {isSubmitting
                        ? 'Procesando...'
                        : recursoAEditar
                            ? 'Guardar Cambios'
                            : 'Crear Recurso'}
                </button>

                {recursoAEditar && (
                    <button
                        type="button"
                        onClick={cancelarEdicion}
                        disabled={isSubmitting}
                        className='rounded bg-gray-200 px-4 py-2 text-gray-800 hover:bg-gray-300 disabled:opacity-60'
                    >
                        Cancelar Edición
                    </button>
                )}
            </div>
        </form>

    )




}

export default FormularioRecurso;


