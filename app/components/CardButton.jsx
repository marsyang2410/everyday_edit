const CardButton = ({ children, onClick }) => (
    <button 
      onClick={onClick} 
      className="w-full h-full p-0 mt-10 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-100"
      >
      {children}
    </button>
  );
export default CardButton;