import React from 'react';
import avatarImg from '../assets/fyp.jpg';

function PersonAvatar({ size = 80 }) {
    return (
        <img
            src={avatarImg}
            alt="Avatar"
            width={size}
            height={size}
            style={{
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid #E5E7EB',
                display: 'block'
            }}
        />
    );
}

export default PersonAvatar;