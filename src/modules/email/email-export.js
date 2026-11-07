/**
 * Mailora.ai — Email Export Module
 */

import { generateEmailHtml } from './email-html-generator.js';
import { copyToClipboard, downloadFile } from '../../utils/helpers.js';

export async function copyEmailHtml(variant, options = {}) {
  const html = generateEmailHtml(variant, options);
  await copyToClipboard(html);
  return html;
}

export function downloadEmailHtmlFile(variant, options = {}) {
  const html = generateEmailHtml(variant, options);
  const brandName = (options.brandName || 'mailora').toLowerCase().replace(/[^a-z0-9]/g, '_');
  const filename = `${brandName}_campaign_${Date.now()}.html`;
  downloadFile(filename, html, 'text/html;charset=utf-8');
  return filename;
}

export async function copyCampaignJson(campaignData) {
  const jsonStr = JSON.stringify(campaignData, null, 2);
  await copyToClipboard(jsonStr);
  return jsonStr;
}

export function downloadCampaignJson(campaignData) {
  const jsonStr = JSON.stringify(campaignData, null, 2);
  const brandName = (campaignData.brandName || 'mailora').toLowerCase().replace(/[^a-z0-9]/g, '_');
  const filename = `${brandName}_campaign_data_${Date.now()}.json`;
  downloadFile(filename, jsonStr, 'application/json;charset=utf-8');
  return filename;
}
