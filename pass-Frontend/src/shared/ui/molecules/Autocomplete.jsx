import React, { useState, useRef, useEffect } from "react";
import { Input } from "../atoms/Input";

export const Autocomplete = ({ 
  options, 
  value, 
  onChange, 
  placeholder = "Search...", 
  name,
  className = "" 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapperRef = useRef(null);

  // Find current label to display when not searching
  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    // Sync search text with selected value when dropdown closes
    if (!isOpen && selectedOption) {
      setSearch(selectedOption.label);
    } else if (!isOpen && !selectedOption) {
      setSearch("");
    }
  }, [isOpen, selectedOption, value]);

  useEffect(() => {
    // Initial sync
    if (selectedOption && !search && !isOpen) {
      setSearch(selectedOption.label);
    }
  }, [selectedOption]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <Input
        type="text"
        placeholder={placeholder}
        value={isOpen ? search : (selectedOption ? selectedOption.label : search)}
        onChange={(e) => {
          setSearch(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => {
          setIsOpen(true);
          setSearch(""); // Clear to show all/search fresh
        }}
        className="w-full form-input"
      />
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt, index) => (
              <div
                key={opt.value || index}
                className="px-4 py-2 cursor-pointer hover:bg-blue-50 text-sm text-gray-700"
                onClick={() => {
                  onChange({ target: { name, value: opt.value } });
                  setSearch(opt.label);
                  setIsOpen(false);
                }}
              >
                {opt.label}
              </div>
            ))
          ) : (
            <div className="px-4 py-2 text-sm text-gray-500">No results found.</div>
          )}
        </div>
      )}
    </div>
  );
};
