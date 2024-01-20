import {PropsWithChildren} from "react";
import { createContext } from "react";
import { useState } from "react";
import { ContextDetails } from "./types";

const AppContext = createContext<ContextDetails | null>(null);

function AppProvider({ children }: PropsWithChildren) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isStaffLoggedIn, setIsStaffLoggedIn] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(true);
  const [currentStaffUID, setCurrentStaffUID] = useState("");

  return (
    <AppContext.Provider
      value={{
        isLoggedIn,
        setIsLoggedIn,
        isAdminLoggedIn,
        setIsAdminLoggedIn,
        isStaffLoggedIn,
        setIsStaffLoggedIn,
        currentStaffUID,
        setCurrentStaffUID
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export { AppProvider, AppContext };
