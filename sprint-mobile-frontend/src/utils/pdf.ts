import { Alert } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { lightColors } from '../constants/theme';
import { VehicleResponse } from '../types/vehicle';
import { MergedSpecCategory, displayValue, isUnavailable } from './specifications';

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const missingStyle = `color: ${lightColors.error}; font-style: italic; background-color: ${lightColors.errorMuted};`;

// Documento base dos relatórios, seguindo a mesma identidade visual do app.
const wrapDocument = (title: string, subtitle: string, table: string) => `
  <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 24px; color: ${lightColors.text}; }
        .brand { background: ${lightColors.primary}; color: ${lightColors.onPrimary}; padding: 16px 20px; border-radius: 8px; }
        .brand h1 { margin: 0; font-size: 22px; }
        .brand p { margin: 4px 0 0; opacity: 0.85; font-size: 13px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 13px; }
        th { background: ${lightColors.surfaceMuted}; padding: 10px; text-align: left; }
        td { padding: 8px 10px; border-bottom: 1px solid ${lightColors.border}; }
        .category td { background: ${lightColors.primary}; color: ${lightColors.onPrimary}; font-weight: bold; }
        footer { margin-top: 24px; font-size: 11px; color: ${lightColors.textSecondary}; }
      </style>
    </head>
    <body>
      <div class="brand">
        <h1>${escapeHtml(title)}</h1>
        <p>${escapeHtml(subtitle)}</p>
      </div>
      ${table}
      <footer>Gerado pelo app Inteligência Competitiva em ${new Date().toLocaleString('pt-BR')}</footer>
    </body>
  </html>
`;

const valueCell = (value?: string, align = 'right') =>
  `<td style="text-align: ${align}; ${isUnavailable(value) ? missingStyle : ''}">${escapeHtml(displayValue(value))}</td>`;

export const buildVehicleReport = (vehicle: VehicleResponse, equipments?: string) => {
  const rows = vehicle.specifications
    .map(cat => {
      const header = `<tr class="category"><td colspan="2">${escapeHtml(cat.categoryName)}</td></tr>`;
      const items = cat.items
        .map(item => `<tr><td>${escapeHtml(item.label)}</td>${valueCell(item.value)}</tr>`)
        .join('');
      return header + items;
    })
    .join('');

  const subtitle = [`Versão: ${vehicle.version || 'N/A'}`, equipments ? `Extras: ${equipments}` : '']
    .filter(Boolean)
    .join(' | ');

  return wrapDocument(
    `Ficha Técnica - ${vehicle.brand} ${vehicle.model}`,
    subtitle,
    `<table><tbody>${rows}</tbody></table>`,
  );
};

export const buildComparisonReport = (v1: VehicleResponse, v2: VehicleResponse, merged: MergedSpecCategory[]) => {
  const rows = merged
    .map(cat => {
      const header = `<tr class="category"><td colspan="3">${escapeHtml(cat.categoryName)}</td></tr>`;
      const items = cat.items
        .map(item => `<tr><td>${escapeHtml(item.label)}</td>${valueCell(item.v1Value, 'center')}${valueCell(item.v2Value, 'center')}</tr>`)
        .join('');
      return header + items;
    })
    .join('');

  const v1Name = `${v1.brand} ${v1.model}`;
  const v2Name = `${v2.brand} ${v2.model}`;
  const table = `
    <table>
      <thead>
        <tr>
          <th style="width: 34%;">Atributo Técnico</th>
          <th style="width: 33%; text-align: center;">${escapeHtml(v1Name)}</th>
          <th style="width: 33%; text-align: center;">${escapeHtml(v2Name)}</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;

  return wrapDocument('Comparação Lado a Lado', `${v1Name} vs ${v2Name}`, table);
};

export const sharePdf = async (html: string, dialogTitle: string) => {
  try {
    const { uri } = await Print.printToFileAsync({ html });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle, UTI: 'com.adobe.pdf' });
    } else {
      Alert.alert('Erro', 'O compartilhamento não está disponível neste dispositivo.');
    }
  } catch (error) {
    console.error('Erro ao exportar PDF:', error);
    Alert.alert('Erro', 'Não foi possível gerar o PDF.');
  }
};
