import { type CollectionEntry, getCollection } from 'astro:content';
import type { PersonaId, TopicId } from './site';

export type GuideEntry = CollectionEntry<'rehberler'>;

export interface Guide {
  href: string;
  title: string;
  blurb: string;
  topic: TopicId;
  personas: PersonaId[];
  order: number;
  dateModified: string;
}

const toGuide = (entry: GuideEntry): Guide => ({
  href: `/${entry.id}/`,
  title: entry.data.navTitle,
  blurb: entry.data.blurb,
  topic: entry.data.topic,
  personas: entry.data.personas,
  order: entry.data.order,
  dateModified: entry.data.dateModified,
});

let cache: Guide[] | undefined;

export const getGuides = async (): Promise<Guide[]> => {
  if (!cache) {
    const entries = await getCollection('rehberler');
    cache = entries.map(toGuide).sort((a, b) => a.order - b.order);
  }
  return cache;
};

export const getGuidesByTopic = async (topic: TopicId): Promise<Guide[]> =>
  (await getGuides()).filter((g) => g.topic === topic);

export const getGuidesForPersona = async (
  persona: PersonaId
): Promise<Guide[]> =>
  (await getGuides()).filter((g) => g.personas.includes(persona));
