import React from 'react';
import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';

interface FeatureCardProps {
  title: string;
  description: string;
  iconName: keyof typeof LucideIcons;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, iconName }) => {
  const IconComponent = LucideIcons[iconName] as React.ComponentType<{ className?: string; strokeWidth?: number }>;

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.01, borderColor: '#3B82F6' }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      className="p-5 bg-card/85 backdrop-blur-sm border border-border-gray rounded-[18px] shadow-sm hover:shadow-md transition-shadow duration-300 flex items-start space-x-4 cursor-pointer group"
    >
      <div className="p-3 bg-light-blue rounded-xl text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
        <motion.div
          whileHover={{ rotate: 10, scale: 1.1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
        >
          {IconComponent && <IconComponent className="w-6 h-6" strokeWidth={1.5} />}
        </motion.div>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-text-dark group-hover:text-primary transition-colors duration-200">
          {title}
        </h3>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
          {description}
        </p>
      </div>
    </motion.div>
  );
};
