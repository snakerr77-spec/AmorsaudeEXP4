declare module "react" {
  export type ReactNode = any;
  export type FormEvent = any;
  export type MouseEvent = any;
  export type RefObject<T> = { current: T | null };
  export function useState<T = any>(initial?: T | (() => T)): [T, (value: T | ((current: T) => T)) => void];
  export function useEffect(effect: () => void | (() => void), deps?: any[]): void;
  export function useMemo<T>(factory: () => T, deps: any[]): T;
  export function useCallback<T extends (...args: any[]) => any>(callback: T, deps: any[]): T;
  export function useRef<T>(initial: T | null): { current: T | null };
  export const StrictMode: any;
}
declare module "react-dom/client" { export function createRoot(element: any): { render(node: any): void }; }
declare module "react/jsx-runtime" { export const jsx: any; export const jsxs: any; export const Fragment: any; }
declare module "motion/react" { export const motion: any; export const AnimatePresence: any; }
declare module "vite" { export function defineConfig(config: any): any; }
declare module "@vitejs/plugin-react" { const react: () => any; export default react; }
declare namespace JSX { interface IntrinsicElements { [elemName: string]: any; } }
