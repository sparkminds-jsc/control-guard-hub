import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Language {
  code: string;
  name: string;
  flag: string;
}

interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const languages: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
];

const translations = {
  en: {
    'nav.framework': 'Generate Control Framework',
    'nav.history': 'Control Framework',
    'nav.company_info': 'Company Info Feedback',
    'nav.company_laws': 'Company Laws Feedback', 
    'nav.company_control': 'Company Control Feedback',
    'button.export': 'Export to Excel',
    'button.view_details': 'View Details',
    'button.verify': 'Verify',
    'button.unverify': 'Unverify',
    'status.verified': 'Verified',
    'status.unverified': 'Unverified',
    'table.no': 'No.',
    'table.law_regulation': 'Law/Regulation',
    'table.domain': 'Domain',
    'table.activity': 'Activity',
    'table.market': 'Market',
    'table.country': 'Country Applied',
    'table.risk_management': 'Risk Management',
    'table.referral_source': 'Referral Source',
    'table.context': 'Context',
    'table.description': 'Description',
    'table.created_at': 'Created At',
    'table.status': 'Status',
    'table.actions': 'Actions',
    'title.laws_regulations': 'Laws and Regulations',
    'title.company_info': 'Company Information',
    'loading': 'Loading...',
    'no_data': 'No data available',
  },
  vi: {
    'nav.framework': 'Tạo Khung Kiểm Soát',
    'nav.history': 'Lịch Sử Khung Kiểm Soát',
    'nav.company_info': 'Phản Hồi Thông Tin Công Ty',
    'nav.company_laws': 'Phản Hồi Luật Công Ty',
    'nav.company_control': 'Phản Hồi Kiểm Soát Công Ty',
    'button.export': 'Xuất Excel',
    'button.view_details': 'Xem Chi Tiết',
    'button.verify': 'Xác Minh',
    'button.unverify': 'Hủy Xác Minh',
    'status.verified': 'Đã Xác Minh',
    'status.unverified': 'Chưa Xác Minh',
    'table.no': 'STT',
    'table.law_regulation': 'Luật/Quy Định',
    'table.domain': 'Lĩnh Vực',
    'table.activity': 'Hoạt Động',
    'table.market': 'Thị Trường',
    'table.country': 'Quốc Gia Áp Dụng',
    'table.risk_management': 'Quản Lý Rủi Ro',
    'table.referral_source': 'Nguồn Giới Thiệu',
    'table.context': 'Bối Cảnh',
    'table.description': 'Mô Tả',
    'table.created_at': 'Ngày Tạo',
    'table.status': 'Trạng Thái',
    'table.actions': 'Hành Động',
    'title.laws_regulations': 'Luật và Quy Định',
    'title.company_info': 'Thông Tin Công Ty',
    'loading': 'Đang tải...',
    'no_data': 'Không có dữ liệu',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(() => {
    const savedLang = localStorage.getItem('app-language');
    return languages.find(lang => lang.code === savedLang) || languages[0];
  });

  const setLanguage = (language: Language) => {
    setCurrentLanguage(language);
    localStorage.setItem('app-language', language.code);
  };

  const t = (key: string): string => {
    return translations[currentLanguage.code as keyof typeof translations]?.[key as keyof typeof translations.en] || key;
  };

  useEffect(() => {
    localStorage.setItem('app-language', currentLanguage.code);
  }, [currentLanguage]);

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export { languages };