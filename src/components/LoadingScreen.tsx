import { motion } from "motion/react";

export function LoadingScreen({ label = "Carregando o LAG Controller" }: { label?: string }) {
  return (
    <div className="app-loading" role="status" aria-live="polite">
      <motion.div
        className="loading-mark"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
      >
        <img src="/assets/images/lag-icon.png" alt="" />
        <motion.span
          animate={{ rotate: 360 }}
          transition={{ duration: 1.3, repeat: Infinity, ease: "linear" }}
        />
      </motion.div>
      <strong>{label}</strong>
      <p>Validando sua sessão com segurança.</p>
    </div>
  );
}
