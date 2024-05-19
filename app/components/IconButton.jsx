const IconButton = ({ children, onClick }) => (
    <button 
      onClick={onClick} 
      className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-offset-2 focus:ring-gray-500"
    >
      {children}
    </button>
  );
export default IconButton;