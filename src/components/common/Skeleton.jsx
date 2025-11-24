import React from 'react';

const Skeleton = ({ className = '', style }) => (
  <div className={`skeleton ${className}`} style={style} aria-hidden="true" />
);

export default Skeleton;