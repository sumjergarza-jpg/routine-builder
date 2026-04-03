import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

interface NavContextType {
  title: string;
  setTitle: (title: string) => void;
}

export const NavContext = createContext<NavContextType>({
  title: '',
  setTitle: () => {},
});

export function NavProvider({ children }: { children: ReactNode }) {
  const [title, setTitle] = useState('');
  return (
    <NavContext.Provider value={{ title, setTitle }}>
      {children}
    </NavContext.Provider>
  );
}

/** Call at the top of any page component to set the nav title. */
export function usePageTitle(title: string) {
  const { setTitle } = useContext(NavContext);
  useEffect(() => {
    setTitle(title);
  }, [title, setTitle]);
}
