import React from 'react';
import PropTypes from 'prop-types';
import avatarImg from '../assets/fyp.jpg';

function PersonAvatar({ size }) {
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
                display: 'block',
            }}
        />
    );
}

PersonAvatar.propTypes = {
    size: PropTypes.number,
};

PersonAvatar.defaultProps = {
    size: 80,
};

export default PersonAvatar;