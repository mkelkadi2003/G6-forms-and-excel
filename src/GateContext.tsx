import { createContext, useContext, type ReactNode } from "react";

export type RequestStep = (label: string, action: () => void) => void;

interface GateValue {
  /** Ask the teacher for the password before running a protected action. */
  requestStep: RequestStep;
}

const GateContext = createContext<GateValue>({
  // Safe fallback: if a component is ever rendered outside the provider, still perform the action.
  requestStep: (_label, action) => action(),
});

export const useGate = () => useContext(GateContext);

export const GateProvider = ({ value, children }: { value: GateValue; children: ReactNode }) => (
  <GateContext.Provider value={value}>{children}</GateContext.Provider>
);
