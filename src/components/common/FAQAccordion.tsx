import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useI18n } from '../../i18n';
import { LocalizedString } from '../../registry/tool-types';

export interface FAQItem {
  question: LocalizedString;
  answer: LocalizedString;
}

interface FAQAccordionProps {
  faqs: FAQItem[];
  className?: string;
}

export const FAQAccordion: React.FC<FAQAccordionProps> = ({ faqs, className = '' }) => {
  const { locale, t } = useI18n();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {faqs.map((faq, index) => {
        const isOpen = openIndex === index;
        const qText = faq.question[locale] || faq.question.en;
        const aText = faq.answer[locale] || faq.answer.en;

        return (
          <div
            key={index}
            className="rounded-2xl border border-stone-200/90 bg-white shadow-xs overflow-hidden transition-colors"
          >
            <button
              onClick={() => toggle(index)}
              aria-expanded={isOpen}
              className="w-full flex items-center justify-between p-4 text-left rtl:text-right text-xs sm:text-sm font-semibold text-stone-900 hover:text-orange-600 transition-colors"
            >
              <span>{qText}</span>
              <ChevronDown
                size={16}
                className={`text-stone-400 shrink-0 transition-transform ${isOpen ? 'rotate-180 text-orange-600' : ''}`}
              />
            </button>

            {isOpen && (
              <div className="px-4 pb-4 pt-1 text-xs text-stone-600 leading-relaxed border-t border-stone-100">
                {aText}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
