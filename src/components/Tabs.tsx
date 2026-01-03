'use client';

import { useState, ReactNode, Children, isValidElement } from 'react';

interface TabProps {
    label: string;
    children: ReactNode;
}

export function Tab({ children }: TabProps) {
    return <>{children}</>;
}

interface TabsProps {
    children: ReactNode;
    defaultTab?: number;
}

export function Tabs({ children, defaultTab = 0 }: TabsProps) {
    const [activeTab, setActiveTab] = useState(defaultTab);
    const tabs = Children.toArray(children).filter(child => isValidElement(child)) as React.ReactElement<TabProps>[];

    return (
        <div className="flex flex-col w-full">
            <div
                className="flex border-b border-gray-100 dark:border-white/10 mb-8 overflow-x-auto"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {/* Hide scrollbar for Chrome/Safari/Opera */}
                <style jsx>{`
                    div::-webkit-scrollbar {
                        display: none;
                    }
                `}</style>
                {tabs.map((tab, index) => (
                    <button
                        key={index}
                        type="button"
                        onClick={() => setActiveTab(index)}
                        className={`px-6 py-3 text-sm font-medium whitespace-nowrap border-b-[2px] transition-all duration-300 focus:outline-none ${activeTab === index
                            ? 'border-ios-blue text-ios-blue'
                            : 'border-transparent text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-200'
                            }`}
                    >
                        {tab.props.label}
                    </button>
                ))}
            </div>
            <div className="flex-1">
                {tabs.map((tab, index) => (
                    <div key={index} className={activeTab === index ? 'block' : 'hidden'}>
                        {tab}
                    </div>
                ))}
            </div>
        </div>
    );
}
