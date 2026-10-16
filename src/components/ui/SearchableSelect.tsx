import React, { useState, useRef, useEffect, useId } from 'react';

interface Option {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  disabled?: boolean;
  id?: string;
  ariaLabel?: string;
}

export function SearchableSelect({ options, value, onChange, placeholder, disabled, id, ariaLabel }: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const generatedId = useId();
  const triggerId = id || `select-trigger-${generatedId}`;
  const listboxId = `select-listbox-${generatedId}`;
  const searchInputId = `select-search-${generatedId}`;

  const selectedOption = options.find(o => o.value === value);

  const closeDropdown = (restoreFocus: boolean) => {
    if (restoreFocus && triggerRef.current) {
      triggerRef.current.focus();
    }
    setIsOpen(false);
    if (restoreFocus) {
      queueMicrotask(() => {
        triggerRef.current?.focus();
      });
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(o => 
    o.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    setActiveIndex(0);
  }, [searchTerm, isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === 'Escape') {
      if (isOpen) {
        e.preventDefault();
        e.stopPropagation();
        closeDropdown(true);
      }
      return;
    }
    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      e.preventDefault();
      setIsOpen(true);
      setSearchTerm('');
      return;
    }
    if (isOpen) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (filteredOptions.length === 0) return;
        const focusedIdx = optionRefs.current.findIndex(el => el !== null && el === document.activeElement);
        const baseIdx = focusedIdx >= 0 ? focusedIdx : activeIndex;
        const nextIdx = (baseIdx + 1) % filteredOptions.length;
        setActiveIndex(nextIdx);
        if (focusedIdx >= 0) {
          optionRefs.current[nextIdx]?.focus();
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (filteredOptions.length === 0) return;
        const focusedIdx = optionRefs.current.findIndex(el => el !== null && el === document.activeElement);
        const baseIdx = focusedIdx >= 0 ? focusedIdx : activeIndex;
        const nextIdx = (baseIdx - 1 + filteredOptions.length) % filteredOptions.length;
        setActiveIndex(nextIdx);
        if (focusedIdx >= 0) {
          optionRefs.current[nextIdx]?.focus();
        }
      } else if (e.key === 'Enter') {
        const focusedIdx = optionRefs.current.findIndex(el => el !== null && el === document.activeElement);
        const targetIdx = focusedIdx >= 0 ? focusedIdx : activeIndex;
        if (filteredOptions[targetIdx]) {
          e.preventDefault();
          e.stopPropagation();
          onChange(filteredOptions[targetIdx].value);
          closeDropdown(true);
        }
      }
    }
  };

  return (
    <div className="relative w-full text-gray-900 font-normal" ref={wrapperRef} onKeyDown={handleKeyDown}>
      <button 
        ref={triggerRef}
        id={triggerId}
        type="button"
        role="combobox"
        aria-label={ariaLabel || placeholder}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={listboxId}
        disabled={disabled}
        className={`w-full text-left border border-gray-300 px-3.5 py-2.5 rounded-lg bg-gray-50 flex justify-between items-center transition-all text-sm ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-white'} ${isOpen ? 'border-blue-900 ring-1 ring-blue-900 bg-white' : ''}`}
        onClick={() => {
          if (!disabled) {
            setIsOpen(!isOpen);
            setSearchTerm('');
          }
        }}
      >
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <span className={`text-xs transition-transform ${isOpen ? 'rotate-180 text-blue-900' : 'text-gray-400'}`} aria-hidden="true">▼</span>
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1.5 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 flex flex-col overflow-hidden text-sm">
          <input
            ref={searchInputRef}
            id={searchInputId}
            name="searchable-select"
            type="text"
            aria-label={`Pesquisar ${ariaLabel || placeholder}`}
            aria-controls={listboxId}
            aria-activedescendant={filteredOptions[activeIndex] ? `${listboxId}-opt-${activeIndex}` : undefined}
            className="w-full px-3.5 py-2.5 border-b border-gray-100 outline-none bg-gray-50 focus:bg-white transition-colors"
            placeholder="Pesquisar..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            autoFocus
          />
          <div id={listboxId} role="listbox" aria-label={ariaLabel || placeholder} className="overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, idx) => {
                const isSelected = option.value === value;
                const isHighlighted = idx === activeIndex;
                return (
                  <button
                    ref={el => { optionRefs.current[idx] = el; }}
                    id={`${listboxId}-opt-${idx}`}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    key={option.value}
                    className={`w-full text-left px-3.5 py-2.5 cursor-pointer truncate transition-colors ${isHighlighted ? 'bg-blue-50 text-blue-900 font-medium' : 'hover:bg-blue-50 hover:text-blue-900'}`}
                    onMouseEnter={() => setActiveIndex(idx)}
                    onFocus={() => setActiveIndex(idx)}
                    onClick={() => {
                      onChange(option.value);
                      closeDropdown(true);
                    }}
                  >
                    {option.label}
                  </button>
                );
              })
            ) : (
              <div className="px-[16px] py-[12px] text-gray-500 text-sm" role="status">Nenhum resultado</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
