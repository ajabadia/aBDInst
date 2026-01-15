'use client';

import React, { useState, ReactNode, Children, isValidElement, cloneElement, ReactElement, ElementType } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface TabProps {
    label: string;
    icon?: ElementType | ReactElement;
    children: ReactNode;
}

export function Tab({ children }: TabProps) {
    return <>{children}</>;
}

interface TabsProps {
    children: ReactNode;
    defaultTab?: number;
    className?: string;
}

export function Tabs({ children, defaultTab = 0, className }: TabsProps) {
    const [activeTab, setActiveTab] = useState(defaultTab);
    const tabs = Children.toArray(children).filter(child => isValidElement(child)) as ReactElement<TabProps>[];

    return (
        <div className="flex flex-col w-full">
            {/* Apple Segmented Control Style Tabs */}
            <div className={cn(
                "flex items-center gap-1 p-1.5 bg-black/[0.03] dark:bg-white/5 rounded-2xl w-fit mb-8 border border-black/5 dark:border-white/5 mx-auto md:mx-0",
                className
            )}>
                {tabs.map((tab, index) => {
                    const isActive = activeTab === index;
                    const Icon = tab.props.icon;

                    return (
                        <button
                            key={index}
                            type="button"
                            onClick={() => setActiveTab(index)}
                            className={cn(
                                "relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all duration-300 whitespace-nowrap outline-none",
                                isActive
                                    ? "text-ios-blue dark:text-white"
                                    : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            )}
                        >
                            {/* Animated Background Indicator */}
                            {isActive && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-white dark:bg-white/10 rounded-xl shadow-apple-sm border border-black/5 dark:border-white/5"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}

                            <span className="relative z-10 flex items-center gap-2">
                                {isValidElement(Icon)
                                    ? cloneElement(Icon as ReactElement<any>, { size: 16, className: cn("stroke-[2.5]", isActive ? "text-ios-blue dark:text-white" : "text-gray-400") })
                                    : (Icon && <Icon size={16} className={cn("stroke-[2.5]", isActive ? "text-ios-blue dark:text-white" : "text-gray-400")} />)
                                }
                                {tab.props.label}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Content Area with smooth transition */}
            <div className="flex-1">
                {tabs.map((tab, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: activeTab === index ? 1 : 0, y: activeTab === index ? 0 : 10 }}
                        transition={{ duration: 0.3 }}
                        className={activeTab === index ? 'block' : 'hidden'}
                    >
                        {tab}
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
