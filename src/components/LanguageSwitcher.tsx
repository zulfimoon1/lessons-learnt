
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex gap-2">
      <Button
        variant={language === 'en' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setLanguage('en')}
      >
        EN
      </Button>
      <Button
        variant={language === 'lt' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setLanguage('lt')}
      >
        LT
      </Button>
    </div>
  );
};

export default LanguageSwitcher;
