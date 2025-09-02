import React, { useContext } from 'react';
import { AuthContext } from '../../providers/AuthContext/AuthContext';

const useAuth = () => {
    return useContext(AuthContext);
};

export default useAuth;
