export default function copyToClipboard(text, addAlert) {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      addAlert('تم نسخ النص إلى الحافظة', '', 'success', 3);
    })
    .catch((error) => {
      addAlert('حدث خطأ أثناء نسخ النص', '', 'error');
    });
}
