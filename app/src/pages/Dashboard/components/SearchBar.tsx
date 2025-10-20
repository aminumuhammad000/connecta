import React, { useState, useEffect, useRef } from 'react';
import { Icon } from '@iconify/react';
import styles from '../styles/SearchBar.module.css';

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (value: string) => void;
  onClear?: () => void;
  onFilter?: (filters: string[]) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  placeholder = "Search jobs...", 
  onSearch, 
  onClear, 
  onFilter 
}) => {
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [filters, setFilters] = useState<string[]>(['Mobile']); // Mobile is checked by default
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filterOptions = [
    { id: 'Design', label: 'Design' },
    { id: 'Mobile', label: 'Mobile' },
    { id: 'Remote', label: 'Remote' },
    { id: 'Budget', label: 'Budget ₦50k+' },
    { id: 'AI', label: 'AI matched' }
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowFilterDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onSearch) {
      onSearch(e.target.value);
    }
  };

  const handleClear = () => {
    if (onClear) {
      onClear();
    }
  };

  const handleFilterToggle = () => {
    setShowFilterDropdown(!showFilterDropdown);
  };

  const handleFilterChange = (filterId: string) => {
    const newFilters = filters.includes(filterId)
      ? filters.filter(f => f !== filterId)
      : [...filters, filterId];
    
    setFilters(newFilters);
    
    if (onFilter) {
      onFilter(newFilters);
    }
  };

  return (
    <div className={styles.searchContainer}>
      <div className={styles.searchBar}>
        <Icon icon="tabler:search" className={styles.searchIcon} />
        <input 
          type="text" 
          placeholder={placeholder}
          className={styles.searchInput}
          onChange={handleInputChange}
        />
        <div className={styles.searchActions}>
          <Icon 
            icon="material-symbols:close" 
            className={styles.clearIcon}
            onClick={handleClear}
          />
          <Icon 
            icon="mdi:filter" 
            className={styles.filterIcon}
            onClick={handleFilterToggle}
          />
        </div>
      </div>
      
      {showFilterDropdown && (
        <div className={styles.filterDropdown} ref={dropdownRef}>
          {filterOptions.map((option) => (
            <div 
              key={option.id}
              className={styles.filterOption}
              onClick={() => handleFilterChange(option.id)}
            >
              <div className={`${styles.filterCheckbox} ${filters.includes(option.id) ? styles.checked : ''}`}>
                {filters.includes(option.id) && (
                  <Icon icon="material-symbols:check" style={{ fontSize: '14px' }} />
                )}
              </div>
              <span className={styles.filterLabel}>{option.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
