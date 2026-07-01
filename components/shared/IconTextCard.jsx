"use client";

import { forwardRef } from "react";
import { motion } from "framer-motion";

const sizeClasses = {
  compact: {
    card: "rounded-xl border border-slate-200 bg-white p-4 transition-colors dark:border-blue-400/20 dark:bg-slate-950/40",
    header: "flex items-center gap-2 mb-2",
    icon: "h-8 w-8 rounded-lg flex items-center justify-center text-sm",
    title: "font-bold text-slate-900 dark:text-white text-sm",
    body: "text-sm text-slate-600 dark:text-blue-100/75",
  },
  inline: {
    card: "rounded-xl border border-slate-200 bg-white p-4 transition-colors dark:border-blue-400/20 dark:bg-slate-950/40",
    header: "flex items-center gap-2",
    icon: "text-base",
    title: "font-bold text-slate-900 dark:text-white",
    body: "mt-1.5 text-sm text-slate-600 dark:text-blue-100/75",
  },
  roomy: {
    card: "rounded-2xl border border-slate-200 bg-white/80 p-6 backdrop-blur-sm",
    header: "flex items-center gap-2 mb-2",
    icon: "h-11 w-11 rounded-xl flex items-center justify-center text-xl",
    title: "font-bold text-slate-800",
    body: "text-sm text-slate-600",
  },
};

function IconTextCard(
  {
    icon,
    title,
    desc,
    color,
    children,
    size = "compact",
    className = "",
    animated = false,
    motionProps = {},
    ...props
  },
  ref
) {
  const styles = sizeClasses[size] || sizeClasses.compact;
  const Component = animated ? motion.div : "div";

  return (
    <Component ref={ref} className={`${styles.card} ${className}`.trim()} {...motionProps} {...props}>
      <div className={styles.header}>
        {size === "inline" ? (
          <span className={styles.icon}>{icon}</span>
        ) : (
          <div
            className={styles.icon}
            style={{ background: `${color}15`, border: `1.5px solid ${color}30` }}
          >
            {icon}
          </div>
        )}
        <div className={styles.title}>{title}</div>
      </div>
      {desc && <p className={styles.body}>{desc}</p>}
      {children}
    </Component>
  );
}

export default forwardRef(IconTextCard);
