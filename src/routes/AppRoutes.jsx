import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import NotFound from '../pages/NotFound';
import MainLayout from '../layouts/MainLayout';
import Login from '../componentes/LoginForm';
import CatalogoProductos from '../pages/CatalogoProductos';
import ProductDetail from '../pages/ProductDetail';
import UncontrolInput from '../pages/UncontrolInput';
import ControlledInput from '../pages/ControlledInput';
import Inicio from '../pages/Inicio';
import { FormularioRegistro } from '../pages/FormularioRegistro';
import Productos from '../pages/Productos';

const Home = () => <h2>Bienvenido a la página de inicio</h2>;
// const Productos = () => <h2> Catálogo de Productos </h2>;
const Contacto = () => <h2>Formulario de Contacto</h2>;
// const DetalleProducto = ({ id }) => <h2>Detalle del Producto con ID: {id}</h2>;


const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route element={<MainLayout />} >
          <Route index element={<Inicio />} />
          <Route path="/productos" element={<CatalogoProductos />} />
          <Route path="/uncontrolinput" element={<UncontrolInput />} />
          <Route path="/controlledInput" element={<ControlledInput />} />
          <Route path="/formulario" element={<FormularioRegistro />} />
          <Route path="/producto/:id" element={<ProductDetail />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/gestionar/productos" element={<Productos />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes; 