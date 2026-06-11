import React from 'react'

export const Logo: React.FC = () => (
  <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
    <img
      src="/images/logo-emblem.png"
      alt="Orienda Logo"
      style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '50%' }}
    />
    <span style={{ fontWeight: 'bold', fontSize: '18px', color: '#4A3B2C' }}>Orienda Hospital</span>
  </div>
)

export const Icon: React.FC = () => (
  <img
    src="/images/logo-emblem.png"
    alt="Orienda Icon"
    style={{ width: '24px', height: '24px', objectFit: 'cover', borderRadius: '50%' }}
  />
)
