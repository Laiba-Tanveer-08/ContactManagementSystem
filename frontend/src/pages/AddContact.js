import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import ContactFormModal from '../components/modals/ContactFormModal';
import { createContact } from '../services/api';

export default function AddContact() {
  const navigate = useNavigate();
  const [show, setShow] = useState(true);

  const handleSave = async (payload) => {
    // Let the modal handle the error display — just re-throw so modal catches it
    await createContact(payload);
    navigate('/contacts');
  };

  const handleClose = () => {
    setShow(false);
    navigate('/contacts');
  };

  return (
      <Layout>
        <div className="page-header"><h1>Add Contact</h1></div>
        {show && <ContactFormModal onClose={handleClose} onSave={handleSave} />}
      </Layout>
  );
}