
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

const AuthHeader = () => {
  return (
    <div className="absolute top-4 right-4 z-10">
      <LanguageSwitcher />
    </div>
  );
};

export default AuthHeader;
