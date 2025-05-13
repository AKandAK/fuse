import React, { createContext, useContext, useState } from 'react';

const QueryContext = createContext(null);

export const QueryProvider = ({ children }) => {
    // keep records ie searched results in state so that they ara avialble even between navigations
    const [records, setRecords] = useState([]);
    const [totalCount, setTotalCount] = useState(0);

    return (
        <QueryContext.Provider value={{ records, setRecords, totalCount, setTotalCount }}>
            {children}
        </QueryContext.Provider>
    );
};

export const useQuery = () => {
    const context = useContext(QueryContext);
    if (!context) {
        throw new Error('useQuery must be used within a QueryProvider');
    }
    return context;
}; 