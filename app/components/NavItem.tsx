interface NavItemProps {
    label: string;
    icon: React.ReactNode;
    isActive: boolean;
    onClick: () => void;
  }
  
  const NavItem: React.FC<NavItemProps> = ({ label, icon, isActive, onClick }) => (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center flex-grow py-2"
    >
      <div className={isActive ? 'text-blue-500' : 'text-gray-500'}>{icon}</div>
      <span
        className={`text-xs ${
          isActive ? 'text-blue-500' : 'text-gray-500'
        } hidden sm:block`}
      >
        {label}
      </span>
    </button>
  );
  
  export default NavItem;
  