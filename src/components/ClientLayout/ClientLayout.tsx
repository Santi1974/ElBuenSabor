import React from 'react';
import ClientHeader from '../ClientHeader/ClientHeader';
import './ClientLayout.css';

interface ClientLayoutProps {
  children: React.ReactNode;
  title?: string;
  showBackButton?: boolean;
  showSearchBar?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  backButtonPath?: string;
}

const ClientLayout: React.FC<ClientLayoutProps> = ({
  children,
  title,
  showBackButton,
  showSearchBar,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  backButtonPath
}) => {
  return (
    <div className="client-layout d-flex flex-column min-vh-100">
      <ClientHeader
        title={title}
        showBackButton={showBackButton}
        showSearchBar={showSearchBar}
        searchValue={searchValue}
        onSearchChange={onSearchChange}
        searchPlaceholder={searchPlaceholder}
        backButtonPath={backButtonPath}
      />
      <main className="flex-grow-1">
        {children}
      </main>
    </div>
  );
};

export default ClientLayout; 