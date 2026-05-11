import React from 'react';

export default function Header({ modelInfo }) {

  return (

    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        background: '#111c3a',
        padding: '20px',
        borderRadius: '12px'
      }}
    >

      <h2>
        🚚 DeliveryAI
      </h2>

      <div>

        {modelInfo
          ? `${modelInfo.best_model} • ${modelInfo.accuracy}%`
          : 'Connecting API...'}

      </div>

    </div>

  );
}