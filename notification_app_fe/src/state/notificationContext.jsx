import { createContext, useContext, useReducer } from "react";

const StateCtx = createContext(null);
const DispatchCtx = createContext(null);

const initial = {
  items: [],
  total: 0,
  page: 1,
  pageSize: 10,
  filter: "",
  loading: false,
  error: null,
  viewed: new Set(),
};

function reducer(state, action) {
  switch (action.type) {
    case "LOADING":
      return { ...state, loading: true, error: null };
    case "LOADED":
      return {
        ...state,
        loading: false,
        items: action.payload.notifications || [],
        total: action.payload.count || 0,
      };
    case "ERROR":
      return { ...state, loading: false, error: action.payload };
    case "PAGE":
      return { ...state, page: action.payload };
    case "FILTER":
      return { ...state, filter: action.payload, page: 1 };
    case "VIEWED": {
      const next = new Set(state.viewed);
      if (Array.isArray(action.payload)) {
        action.payload.forEach(function (id) { next.add(id); });
      } else {
        next.add(action.payload);
      }
      return { ...state, viewed: next };
    }
    default:
      return state;
  }
}

function NotifProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initial);

  return (
    <StateCtx.Provider value={state}>
      <DispatchCtx.Provider value={dispatch}>{children}</DispatchCtx.Provider>
    </StateCtx.Provider>
  );
}

function useNotifState() {
  const ctx = useContext(StateCtx);
  if (!ctx) throw new Error("useNotifState must be inside NotifProvider");
  return ctx;
}

function useNotifDispatch() {
  const ctx = useContext(DispatchCtx);
  if (!ctx) throw new Error("useNotifDispatch must be inside NotifProvider");
  return ctx;
}

export { NotifProvider, useNotifState, useNotifDispatch };
