import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '@/store';
import { useDispatch } from 'react-redux';
import { setLoading } from '@/store/authSlice';
import CenteredLoader from '@/components/CenteredLoader';

function PersistorGate({ children }) {
  const dispatch = useDispatch();

  return (
    <PersistGate
      loading={<CenteredLoader fullScreen />}
      persistor={persistor}
      onBeforeLift={() => {
        // Set loading to false when persistor is ready
        dispatch(setLoading(false));
      }}
    >
      {children}
    </PersistGate>
  );
}

export function ReduxProvider({ children }) {
  return (
    <Provider store={store}>
      <PersistorGate>
        {children}
      </PersistorGate>
    </Provider>
  );
}
