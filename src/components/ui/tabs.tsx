"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const TabsContext = React.createContext<{
  selectedTab: string;
  setSelectedTab: (tab: string) => void;
}>({
  selectedTab: "",
  setSelectedTab: () => {},
});

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  children: React.ReactNode;
}

export function Tabs({
  defaultValue,
  value,
  onValueChange,
  className,
  children,
  ...props
}: TabsProps) {
  const [selectedTab, setSelectedTab] = React.useState(value || defaultValue);

  React.useEffect(() => {
    if (value) {
      setSelectedTab(value);
    }
  }, [value]);

  const handleTabChange = (tab: string) => {
    if (!value) {
      setSelectedTab(tab);
    }
    onValueChange?.(tab);
  };

  return (
    <TabsContext.Provider value={{ selectedTab, setSelectedTab: handleTabChange }}>
      <div className={cn("tabs", className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
}

export function TabsList({ className, children, ...props }: TabsListProps) {
  return (
    <div className={cn("tabs-list", className)} role="tablist" {...props}>
      {children}
    </div>
  );
}

export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  className?: string;
  children: React.ReactNode;
}

export function TabsTrigger({
  value,
  className,
  children,
  ...props
}: TabsTriggerProps) {
  const { selectedTab, setSelectedTab } = React.useContext(TabsContext);
  
  return (
    <button
      role="tab"
      aria-selected={selectedTab === value}
      onClick={() => setSelectedTab(value)}
      className={cn(
        "tabs-trigger",
        selectedTab === value && "active",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  className?: string;
  children: React.ReactNode;
}

export function TabsContent({
  value,
  className,
  children,
  ...props
}: TabsContentProps) {
  const { selectedTab } = React.useContext(TabsContext);
  
  return selectedTab === value ? (
    <div
      role="tabpanel"
      className={cn("tabs-content", className)}
      {...props}
    >
      {children}
    </div>
  ) : null;
}
