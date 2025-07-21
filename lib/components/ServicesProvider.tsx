import { useRef } from 'react';
import {
  createServicesStore,
  Services,
  ServicesContext,
  ServicesStore,
} from '../stores/services';

export function ServicesProvider({
  children,
  ...props
}: React.PropsWithChildren<Services>) {
  const storeRef = useRef<ServicesStore>(null);
  if (!storeRef.current) {
    storeRef.current = createServicesStore(props);
  }

  return (
    <ServicesContext.Provider value={storeRef.current}>
      {children}
    </ServicesContext.Provider>
  );
}
