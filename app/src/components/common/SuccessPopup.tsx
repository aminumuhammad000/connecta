import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';

interface SuccessPopupProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
}

const SuccessPopup: React.FC<SuccessPopupProps> = ({ isOpen, onClose, title, message }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    />

                    {/* Popup Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5, y: 50 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.5, y: 50 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center overflow-hidden"
                    >
                        {/* Background Decoration */}
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-400 to-[#FD6730]" />

                        {/* Animated Icon */}
                        <div className="mb-6 flex justify-center">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", delay: 0.2, bounce: 0.5 }}
                                className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center"
                            >
                                <Icon icon="mdi:check-circle" className="text-green-500 w-12 h-12" />
                            </motion.div>
                        </div>

                        <h3 className="text-2xl font-bold text-gray-900 mb-3">{title}</h3>
                        <p className="text-gray-600 mb-8 leading-relaxed">
                            {message}
                        </p>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onClose}
                            className="w-full py-3.5 bg-[#FD6730] text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 hover:bg-[#e05625] transition-colors"
                        >
                            Continue
                        </motion.button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default SuccessPopup;
