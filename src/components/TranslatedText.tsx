import { useTranslation } from 'react-i18next';

interface TranslatedTextProps {
  text: string;
  className?: string;
}

export function TranslatedText({ text, className }: TranslatedTextProps) {
  const { t } = useTranslation();
  return <span className={className}>{t(text)}</span>;
} 