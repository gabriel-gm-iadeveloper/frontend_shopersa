import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProductCard from './ProductCard';
import { CartProvider } from '../../context/CartContext';
import { describe, it, expect } from 'vitest';

// Mock de los datos del producto
const mockProduct = {
    id: 1,
    nombre: 'Producto de Prueba',
    precio: 10000,
    precio_oferta: 0,
    imagenes: ['/img/test.jpg'],
    stock: 5,
    active: true,
    estado_producto: true
};

const renderWithProviders = (component) => {
    return render(
        <BrowserRouter>
            <CartProvider>
                {component}
            </CartProvider>
        </BrowserRouter>
    );
};

describe('ProductCard Component', () => {
    
    // TEST 1
    it('debería renderizar el nombre del producto', () => {
        renderWithProviders(<ProductCard product={mockProduct} />);
        expect(screen.getByText('Producto de Prueba')).toBeInTheDocument();
    });

    // TEST 2
    it('debería mostrar el precio formateado correctamente', () => {
        renderWithProviders(<ProductCard product={mockProduct} />);
        const priceElement = screen.getByText((content) => content.includes('10.000'));
        expect(priceElement).toBeInTheDocument();
    });

    // TEST 3
    it('debería tener el botón de agregar habilitado si hay stock', () => {
        renderWithProviders(<ProductCard product={mockProduct} />);
        const button = screen.getByRole('button', { name: /agregar/i });
        expect(button).not.toBeDisabled();
    });

    // TEST 4
    it('debería deshabilitar el botón si no hay stock', () => {
        const outOfStockProduct = { ...mockProduct, stock: 0 };
        renderWithProviders(<ProductCard product={outOfStockProduct} />);
        const button = screen.getByRole('button', { name: /agregar/i });
        expect(button).toBeDisabled();
    });

    // TEST 5 (NUEVO): Interacción del usuario
    it('debería cambiar el texto a "Agregado!" al hacer clic en el botón', async () => {
        renderWithProviders(<ProductCard product={mockProduct} />);
        
        const button = screen.getByRole('button', { name: /agregar/i });
        
        // Simulamos el clic
        fireEvent.click(button);
        
        // Esperamos que aparezca el texto de confirmación
        // Usamos findByText que es asíncrono para esperar el cambio de estado
        const successMessage = await screen.findByText('Agregado!');
        expect(successMessage).toBeInTheDocument();
    });
});