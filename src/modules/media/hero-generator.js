/**
 * Mailora.ai — Hero Image Generator Module
 */

import { imageService } from '../../services/image.service.js';
import { creditsService } from '../../services/credits.service.js';
import { eventBus, EVENTS } from '../../core/event-bus.js';

export async function generateHeroForCampaign(prompt, archetype = 'universal_modern') {
  // Check and deduct 1 credit
  await creditsService.deductCredits(1, 'HERO_GENERATION');
  const imageUrl = await imageService.generateHeroImage(prompt, archetype);
  eventBus.emit(EVENTS.IMAGE_UPDATED, imageUrl);
  return imageUrl;
}
