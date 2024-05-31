import React from 'react';
import './Card.css';

const Card = ({ imageSrc, title, description, id = ""}) => {
  return (
    <div className="card">
      <img id={id} src={imageSrc} alt={title} className="card-image" />
      <div className="card-content">
        <h2 className="card-title">{title}</h2>
        <p className="card-description">{description}</p>
      </div>
    </div>
  );
};

export default Card;
