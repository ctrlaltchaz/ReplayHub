'use client';

import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { useState } from 'react';

export interface TabItem {
    value: string;
    label: string;
    icon?: React.ReactNode;
}

interface MobileTabNavigationProps {
    tabs: TabItem[];
    activeTab: string;
    onTabChange: (value: string) => void;
    title?: string;
    description?: string;
}

export function MobileTabNavigation({
    tabs,
    activeTab,
    onTabChange,
    title = 'Navigation',
    description = 'Select a tab',
}: MobileTabNavigationProps) {
    const [open, setOpen] = useState(false);

    const handleTabClick = (value: string) => {
        onTabChange(value);
        setOpen(false);
    };

    const activeTabItem = tabs.find(tab => tab.value === activeTab);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <Menu className="h-4 w-4" />
                    {activeTabItem?.label || 'Menu'}
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px]">
                <SheetHeader>
                    <SheetTitle>{title}</SheetTitle>
                    <SheetDescription>{description}</SheetDescription>
                </SheetHeader>
                <div className="mt-6 flex flex-col gap-2">
                    {tabs.map((tab) => (
                        <Button
                            key={tab.value}
                            variant={activeTab === tab.value ? 'default' : 'ghost'}
                            className="justify-start gap-2"
                            onClick={() => handleTabClick(tab.value)}
                        >
                            {tab.icon}
                            {tab.label}
                        </Button>
                    ))}
                </div>
            </SheetContent>
        </Sheet>
    );
}
