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
      whileHover={{ y: -4, scale: 1.01, borderColor: '#2563EB' }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      className="p-5 bg-white border border-[#E5E7EB] rounded-[16px] cc-shadow-sm hover:cc-shadow-md transition-shadow duration-300 flex items-start space-x-4 cursor-pointer group"
    >
      <div className="p-3 bg-[#F3F4F6] rounded-[12px] text-[#0A0A0A] group-hover:bg-[#2563EB] group-hover:text-white transition-colors duration-300">
        <motion.div
          whileHover={{ rotate: 10, scale: 1.1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
        >
          {IconComponent && <IconComponent className="w-5.5 h-5.5" strokeWidth={1.75} />}
        </motion.div>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="cc-display text-[15px] font-semibold text-[#0A0A0A] group-hover:text-[#2563EB] transition-colors duration-200">
          {title}
        </h3>
        <p className="text-xs text-[#4B5563] mt-1 leading-relaxed">
          {description}
        </p>
      </div>
    </motion.div>
  );
};
