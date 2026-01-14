import type { SkillDefinition, PlayerClass, SkillName } from '../types';
import { shiftSkill } from './disruptor/shift';
import { freezeSkill } from './disruptor/freeze';
import { vanishSkill } from './disruptor/vanish';
import { doubleStepSkill } from './tactician/doubleStep';
import { shieldSkill } from './tactician/shield';
import { swapSkill } from './tactician/swap';

/**
 * Skill Registry - maps skill names to their definitions
 */
export const SKILL_REGISTRY: Record<SkillName, SkillDefinition> = {
  shift: shiftSkill,
  freeze: freezeSkill,
  vanish: vanishSkill,
  doubleStep: doubleStepSkill,
  shield: shieldSkill,
  swap: swapSkill,
};

/**
 * Get all skills for a specific class
 */
export function getSkillsForClass(playerClass: PlayerClass): SkillDefinition[] {
  return Object.values(SKILL_REGISTRY).filter(
    skill => skill.playerClass === playerClass
  );
}

/**
 * Get skill definition by name
 */
export function getSkillByName(name: SkillName): SkillDefinition {
  const skill = SKILL_REGISTRY[name];
  if (!skill) {
    throw new Error(`Skill not found: ${name}`);
  }
  return skill;
}

/**
 * Get all skill names
 */
export function getAllSkillNames(): SkillName[] {
  return Object.keys(SKILL_REGISTRY) as SkillName[];
}
