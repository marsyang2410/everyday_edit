import React, { useState , useEffect , useRef } from 'react';
import './Collapse.css'; 

const Collapse = ({children}) => {
  const [isActive, setIsActive] = useState(false);
  const contentRef = useRef(null);

  const toggleCollapse = () => {
    setIsActive(!isActive);
  };

  useEffect(() => {
    if (isActive) {
      contentRef.current.style.maxHeight = contentRef.current.scrollHeight + "px";
    } else {
      contentRef.current.style.maxHeight = "0px";
    }
  }, [isActive]);

  return (
    <div className="collapsible">
      <button className="collapsible-button" onClick={toggleCollapse}>
        Toggle Content
      </button>
      <div ref={contentRef} className={`collapsible-content ${isActive ? 'active' : ''}`}>
        {children}
      </div>
    </div>
  );
};

export default Collapse;
