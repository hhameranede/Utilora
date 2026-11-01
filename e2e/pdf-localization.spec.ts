import { expect, test } from '@playwright/test';

const localizedMergeWorkspace = [
  {
    locale: 'en', direction: 'ltr', toolName: 'Merge PDF', suffix: 'settings',
    choose: 'Choose PDF files to merge', summary: 'PDF · Up to 100 MB per file · Processed locally',
    selected: 'Selected files (0)', clear: 'Clear list', empty: 'No files selected yet.', action: 'Merge PDFs',
  },
  {
    locale: 'ar', direction: 'rtl', toolName: 'دمج ملفات PDF', suffix: 'الإعدادات',
    choose: 'اختر ملفات PDF لدمجها', summary: 'PDF · حتى 100 ميغابايت لكل ملف · تتم المعالجة محلياً',
    selected: 'الملفات المحددة (0)', clear: 'مسح القائمة', empty: 'لم يتم اختيار أي ملفات بعد.', action: 'دمج ملفات PDF',
  },
  {
    locale: 'fr', direction: 'ltr', toolName: 'Fusionner PDF', suffix: 'paramètres',
    choose: 'Choisir les fichiers PDF à fusionner', summary: 'PDF · Jusqu’à 100 Mo par fichier · Traitement local',
    selected: 'Fichiers sélectionnés (0)', clear: 'Vider la liste', empty: 'Aucun fichier sélectionné pour le moment.', action: 'Fusionner les PDF',
  },
  {
    locale: 'es', direction: 'ltr', toolName: 'Unir PDF', suffix: 'ajustes',
    choose: 'Elegir archivos PDF para combinar', summary: 'PDF · Hasta 100 MB por archivo · Procesamiento local',
    selected: 'Archivos seleccionados (0)', clear: 'Vaciar lista', empty: 'Aún no hay archivos seleccionados.', action: 'Unir PDF',
  },
  {
    locale: 'pt', direction: 'ltr', toolName: 'Juntar PDF', suffix: 'configurações',
    choose: 'Selecionar arquivos PDF para juntar', summary: 'PDF · Até 100 MB por arquivo · Processamento local',
    selected: 'Arquivos selecionados (0)', clear: 'Limpar lista', empty: 'Nenhum arquivo selecionado ainda.', action: 'Juntar PDFs',
  },
  {
    locale: 'hi', direction: 'ltr', toolName: 'पीडीएफ मिलाएं', suffix: 'सेटिंग',
    choose: 'मर्ज करने के लिए PDF फ़ाइलें चुनें', summary: 'PDF · प्रति फ़ाइल अधिकतम 100 MB · स्थानीय रूप से संसाधित',
    selected: 'चयनित फ़ाइलें (0)', clear: 'सूची साफ़ करें', empty: 'अभी कोई फ़ाइल चयनित नहीं है।', action: 'PDF मर्ज करें',
  },
  {
    locale: 'zh', direction: 'ltr', toolName: '合并 PDF', suffix: '设置',
    choose: '选择要合并的 PDF 文件', summary: 'PDF · 每个文件最大 100 MB · 本地处理',
    selected: '已选文件 (0)', clear: '清空列表', empty: '尚未选择任何文件。', action: '合并 PDF',
  },
  {
    locale: 'bn', direction: 'ltr', toolName: 'পিডিএফ মার্জ করুন', suffix: 'সেটিংস',
    choose: 'মার্জ করার জন্য PDF ফাইল নির্বাচন করুন', summary: 'PDF · প্রতি ফাইলে সর্বোচ্চ 100 MB · স্থানীয়ভাবে প্রক্রিয়াকৃত',
    selected: 'নির্বাচিত ফাইল (0)', clear: 'তালিকা খালি করুন', empty: 'এখনও কোনো ফাইল নির্বাচন করা হয়নি।', action: 'PDF মার্জ করুন',
  },
] as const;

for (const copy of localizedMergeWorkspace) {
  test(`Merge PDF workspace controls are localized for ${copy.locale}`, async ({ page }) => {
    await page.goto(`/${copy.locale}/tools/merge-pdf`);

    const workspace = page.locator('#tool-workspace');
    await expect(page.locator('html')).toHaveAttribute('lang', copy.locale);
    await expect(page.locator('html')).toHaveAttribute('dir', copy.direction);
    await expect(workspace).toContainText(copy.toolName);
    await expect(workspace).toContainText(`${copy.toolName} · ${copy.suffix}`);
    await expect(workspace).toContainText(copy.choose);
    await expect(workspace).toContainText(copy.summary);
    await expect(workspace).toContainText(copy.selected);
    await expect(workspace.getByRole('button', { name: copy.clear })).toBeVisible();
    await expect(workspace).toContainText(copy.empty);
    await expect(workspace.getByRole('button', { name: copy.action })).toBeVisible();

    if (copy.locale !== 'en') {
      await expect(workspace).not.toContainText('Choose PDF files to merge');
      await expect(workspace).not.toContainText('Selected files');
      await expect(workspace).not.toContainText('Merge PDF settings');
      await expect(workspace).not.toContainText('Processed locally');
    }
  });
}
