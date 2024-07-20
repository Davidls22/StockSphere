
import React, { createContext, useState, ReactNode } from 'react';


interface StockContextType {
  stock: any; 
  setStock: React.Dispatch<React.SetStateAction<any>>; 
}

const defaultContextValue: StockContextType = {
  stock: null,
  setStock: () => {},
};

const StockContext = createContext<StockContextType>(defaultContextValue);

export const StockProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [stock, setStock] = useState<any>(null); 

  return (
    <StockContext.Provider value={{ stock, setStock }}>
      {children}
    </StockContext.Provider>
  );
};

export default StockContext;
