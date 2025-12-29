import { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { BRAND_NAME } from '@/core/config/brand';

const SanityComponent = () => {
  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#fff', 
      borderRadius: '8px', 
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      border: '2px solid #4F46E5',
      fontFamily: 'sans-serif'
    }}>
      <h1 style={{ color: '#4F46E5', margin: '0 0 10px 0' }}>🚀 {BRAND_NAME} Sanity Check</h1>
      <p style={{ color: '#333', fontSize: '16px' }}>
        Si ves este cuadro, el <strong>Preview de Storybook</strong> está funcionando correctamente.
      </p>
      <div style={{ 
        marginTop: '20px', 
        padding: '15px', 
        backgroundColor: '#EEF2FF', 
        borderRadius: '4px',
        textAlign: 'center'
      }}>
        <span style={{ fontWeight: 'bold', color: '#4338CA' }}>
          PRUEBA DE AISLAMIENTO (SIN GLUESTACK)
        </span>
      </div>
    </div>
  );
};

const meta: Meta<typeof SanityComponent> = {
  title: 'Sanity/Sanity Check',
  component: SanityComponent,
  parameters: {
    layout: 'centered',
    // Usamos el parámetro que creamos en preview.tsx para saltar Gluestack
    noGluestack: true,
  },
};

export default meta;
type Story = StoryObj<typeof SanityComponent>;

export const Default: Story = {};




















