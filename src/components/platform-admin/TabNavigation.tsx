
interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TabNavigation = ({ activeTab, onTabChange }: TabNavigationProps) => {
  return (
    <div className="w-full mb-6">
      <div className="flex space-x-1 rounded-xl bg-slate-100 p-1">
        <button
          type="button"
          className={`w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all duration-200 ${
            activeTab === 'login'
              ? 'bg-white text-blue-700 shadow'
              : 'text-slate-700 hover:bg-white/50 hover:text-slate-900'
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
              : 'text-slate-700 hover:bg-white/50 hover:text-slate-900'
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
