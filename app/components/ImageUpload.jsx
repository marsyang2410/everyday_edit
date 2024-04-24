// /components/ImageUploader.jsx
import React, { useState } from 'react';

function ImageUploader() {
    const [imageSrc, setImageSrc] = useState(null);

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => setImageSrc(e.target.result);
            reader.readAsDataURL(file);
        } else {
            alert('Please select an image file.');
        }
    };

    return (
        <div style={{ textAlign: 'center' }}>
            <input type="file" accept="image/*" onChange={handleImageChange} />
            {imageSrc && (
                <div>
                    <h2>Preview:</h2>
                    <img src={imageSrc} alt="Uploaded" style={{ maxWidth: '100%', height: 'auto' }} />
                </div>
            )}
        </div>
    );
}

export default ImageUploader;
