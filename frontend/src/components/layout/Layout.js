import React from 'react';
import PropTypes from 'prop-types';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import './Layout.css';

export default function Layout({ children, onSearch, searchValue, onImportDone }) {
    return (
        <div className="layout">
            <Sidebar onImportDone={onImportDone} />
            <div className="layout-main">
                <Navbar onSearch={onSearch} searchValue={searchValue} />
                <main className="layout-content">{children}</main>
            </div>
        </div>
    );
}

Layout.propTypes = {
    children: PropTypes.node.isRequired,
    onSearch: PropTypes.func,
    searchValue: PropTypes.string,
    onImportDone: PropTypes.func,
};

Layout.defaultProps = {
    onSearch: undefined,
    searchValue: '',
    onImportDone: undefined,
};