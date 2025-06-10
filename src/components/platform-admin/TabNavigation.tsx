
interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TabNavigation = ({ activeTab, onTabChange }: TabNavigationProps) => {
  return (
    <div className="w-full mb-6">
      <div className="flex space-x-1 rounded-xl bg-blue-900/20 p-1">
        <button
          type="button"
          className={`w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all duration-200 ${
            activeTab === 'login'
              ? 'bg-white text-blue-700 shadow'
              : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
          }`}
          onClick={() => onTabChange('login')}
        >
          Login
        </button>
        <button
          type="button"
          className={`w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all duration-200 ${
            activeTab === 'create'
              ? 'bg-white text-blue-700 shadow'
              : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
          }`}
          onClick={() => onTabChange('create')}
        >
          Create Account
        </button>
      </div>
    </div>
  );
};

export default TabNavigation;
