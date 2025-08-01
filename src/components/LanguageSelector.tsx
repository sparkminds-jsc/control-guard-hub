import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useLanguage, languages } from "@/hooks/useLanguage";

export const LanguageSelector = () => {
  const { currentLanguage, setLanguage } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="h-8 px-2 text-header-foreground hover:bg-gray-100 border border-gray-300"
        >
          <span className="mr-1 text-base">{currentLanguage.flag}</span>
          <span className="font-medium text-sm">{currentLanguage.code.toUpperCase()}</span>
          <ChevronDown className="h-3 w-3 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-40 bg-white border border-gray-200 shadow-lg z-50"
      >
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => setLanguage(language)}
            className="flex items-center px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
          >
            <span className="mr-2 text-base">{language.flag}</span>
            <span className="font-medium">{language.name}</span>
            {currentLanguage.code === language.code && (
              <span className="ml-auto text-blue-600">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};