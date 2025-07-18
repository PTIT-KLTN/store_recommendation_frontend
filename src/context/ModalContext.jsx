import React, { createContext, useState, useContext } from 'react';
import ShoppingModal from '../components/ShoppingModal';

const ModalContext = createContext();

export const useModal = () => useContext(ModalContext);

export const ModalProvider = ({ children }) => {
    const [modalState, setModalState] = useState({
        isOpen: false,
        type: '',
        itemData: null,
        searchQuery: ''
    });

    const openModal = (type, itemData, searchQuery = '') => {
        setModalState({
            isOpen: true,
            type,
            itemData,
            searchQuery
        });
    };

    const closeModal = () => {
        setModalState({
            isOpen: false,
            type: '',
            itemData: null,
            searchQuery: ''
        });
    };

    return (
        <ModalContext.Provider value={{ modalState, openModal, closeModal }}>
            {children}
            <ShoppingModal
                isOpen={modalState.isOpen}
                onClose={closeModal}
                type={modalState.type}
                itemData={modalState.itemData}
                searchQuery={modalState.searchQuery}
            />
        </ModalContext.Provider>
    );
};

export default ModalContext;