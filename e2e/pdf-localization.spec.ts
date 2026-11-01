import { expect, test } from '@playwright/test';

const localizedMergeWorkspace = [
  {
    locale: 'en',
    direction: 'ltr',
    choose: 'Choose PDF files to merge',
    selected: 'Selected files (0)',
    clear: 'Clear list',
    empty: 'No files selected yet.',
    action: 'Merge PDFs',
    settings: 'Merge PDF settings',
  },
  {
    locale: 'ar',
    direction: 'rtl',
    choose: 'اختر ملفات PDF لدمجها',
    selected: 'الملفات المحددة (0)',
    clear: 'مسح القائمة',
    empty: 'لم يتم اختيار أي ملفات بعد.',
    action: 'دمج ملفات PDF',
    settings: 'إعدادات دمج PDF',
  },
  {
    locale: 'fr',
    direction: 'ltr',
    choose: 'Choisir les fichiers PDF à fusionner',
    selected: 'Fichiers sélectionnés (0)',
    clear: 'Vider la liste',
    empty: 'Aucun fichier sélectionné pour le moment.',
    action: 'Fusionner les PDF',
    settings: 'Paramètres de fusion PDF',
  },
  {
    locale: 'es',
    direction: 'ltr',
    choose: 'Elegir archivos PDF para combinar',
    selected: 'Archivos seleccionados (0)',
    clear: 'Vaciar lista',
    empty: 'Aún no hay archivos seleccionados.',
    action: 'Combinar PDF',
    settings: 'Ajustes de combinación de PDF',
  },
  {
    locale: 'pt',
    direction: 'ltr',
    choose: 'Selecionar arquivos PDF para juntar',
    selected: 'Arquivos selecionados (0)',
    clear: 'Limpar lista',
    empty: 'Nenhum arquivo selecionado ainda.',
    action: 'Juntar PDFs',
    settings: 'Configurações de junção de PDF',
  },
  {
    locale: 'hi',
    direction: 'ltr',
    choose: 'मर्ज करने के लिए PDF फ़ाइलें चुनें',
    selected: 'चयनित फ़ाइलें (0)',
    clear: 'सूची साफ़ करें',
    empty: 'अभी कोई फ़ाइल चयनित नहीं है।',
    action: 'PDF मर्ज करें',
    settings: 'PDF मर्ज सेटिंग्स',
  },
  {
    locale: 'zh',
    direction: 'ltr',
    choose: '选择要合并的 PDF 文件',
    selected: '已选文件（0）',
    clear: '清空列表',
    empty: '尚未选择任何文件。',
    action: '合并 PDF',
    settings: '合并 PDF 设置',
  },
  {
    locale: 'bn',
    direction: 'ltr',
    choose: 'মার্জ করার জন্য PDF ফাইল নির্বাচন করুন',
    selected: 'নির্বাচিত ফাইল (0)',
    clear: 'তালিকা খালি করুন',
    empty: 'এখনও কোনো ফাইল নির্বাচন করা হয়নি।',
    action: 'PDF মার্জ করুন',
    settings: 'PDF মার্জ সেটিংস',
  },
] as const;

for (const copy of localizedMergeWorkspace) {
  test(`Merge PDF workspace controls are localized for ${copy.locale}`, async ({ page }) => {
    await page.goto(`/${copy.locale}/tools/merge-pdf`);

    await expect(page.locator('html')).toHaveAttribute('lang', copy.locale);
    await expect(page.locator('html')).toHaveAttribute('dir', copy.direction);
    await expect(page.locator('#tool-workspace')).toContainText(copy.choose);
    await expect(page.locator('#tool-workspace')).toContainText(copy.selected);
    await expect(page.locator('#tool-workspace').getByRole('button', { name: copy.clear })).toBeVisible();
    await expect(page.locator('#tool-workspace')).toContainText(copy.empty);
    await expect(page.locator('#tool-workspace').getByRole('button', { name: copy.action })).toBeVisible();
    await expect(page.locator('#tool-workspace')).toContainText(copy.settings);

    if (copy.locale !== 'en') {
      await expect(page.locator('#tool-workspace')).not.toContainText('Choose PDF files to merge');
      await expect(page.locator('#tool-workspace')).not.toContainText('Selected files');
      await expect(page.locator('#tool-workspace')).not.toContainText('Merge PDF settings');
    }
  });
}
