
interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TabNavigation = ({ activeTab, onTabChange }: TabNavigationProps) => {
  return (
    <div className="w-full mb-6">
      <div className="flex space-x-1 rounded-xl bg-slate-200 p-1 border">
        <button
          type="button"
          className={`w-full rounded-lg py-3 px-4 text-sm font-semibold leading-5 transition-all duration-200 ${
            activeTab === 'login'
              ? 'bg-white text-blue-700 shadow-md border border-blue-200'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
          }`}
          onClick={() => onTabChange('login')}
        >
          Login
        </button>
        <button
          type="button"
          className={`w-full rounded-lg py-3 px-4 text-sm font-semibold leading-5 transition-all duration-200 ${
            activeTab === 'create'
              ? 'bg-white text-blue-700 shadow-md border border-blue-200'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
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
