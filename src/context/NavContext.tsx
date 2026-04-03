import { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode, MutableRefObject } from 'react';

interface NavContextType {
  title: string;
  setTitle: (title: string) => void;
  /** ReactNode rendered in TopNav's right zone (replaces profile icon when set). */
  rightSlot: ReactNode;
  setRightSlot: (slot: ReactNode) => void;
  /**
   * Pages can set this ref to intercept TopNav navigation attempts.
   * TopNav calls interceptorRef.current(proceed) instead of navigating directly.
   * The interceptor either calls proceed() or shows a confirmation first.
   */
  navInterceptorRef: MutableRefObject<((proceed: () => void) => void) | null>;
}

export const NavContext = createContext<NavContextType>({
  title: '',
  setTitle: () => {},
  rightSlot: null,
  setRightSlot: () => {},
  navInterceptorRef: { current: null },
});

export function NavProvider({ children }: { children: ReactNode }) {
  const [title, setTitle] = useState('');
  const [rightSlot, setRightSlot] = useState<ReactNode>(null);
  const navInterceptorRef = useRef<((proceed: () => void) => void) | null>(null);

  return (
    <NavContext.Provider value={{ title, setTitle, rightSlot, setRightSlot, navInterceptorRef }}>
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
