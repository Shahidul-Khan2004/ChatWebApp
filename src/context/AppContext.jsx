import { createContext } from "react";

export const AppContext = createContext();

const AppContextProvoder = (props) => {
    
    const value = {

    }
    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}

export default AppContextProvoder