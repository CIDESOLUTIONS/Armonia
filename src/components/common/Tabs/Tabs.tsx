import React from 'react';

interface TabsProps {
    tabs: Array<{
        key: string;
        label: string;
        content: React.ReactNode;
    }>;
    activeKey: string;
    onChange: (key: string) => void;
}

const Tabs = (props) => {
    return (
        <div>
            {/* Component implementation will go here */}
        </div>
    );
};

export default Tabs;
