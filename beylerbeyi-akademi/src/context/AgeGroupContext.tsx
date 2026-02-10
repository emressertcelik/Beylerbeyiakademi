"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface AgeGroupContextType {
  selectedAge: string;
  setSelectedAge: (age: string) => void;
}

const AgeGroupContext = createContext<AgeGroupContextType>({
  selectedAge: "U15",
  setSelectedAge: () => {},
});

export function AgeGroupProvider({ children }: { children: ReactNode }) {
  const [selectedAge, setSelectedAge] = useState("U15");
  return (
    <AgeGroupContext.Provider value={{ selectedAge, setSelectedAge }}>
      {children}
    </AgeGroupContext.Provider>
  );
}

export function useAgeGroup() {
  return useContext(AgeGroupContext);
}
