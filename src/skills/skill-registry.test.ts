import { describe, it, expect } from 'vitest';
import { getSkillsForClass, getSkillByName, getAllSkillNames } from './skill-registry';

describe('getSkillsForClass', () => {
  it('should return correct skills for disruptor class', () => {
    const skills = getSkillsForClass('disruptor');

    expect(skills).toHaveLength(3);
    expect(skills.map(s => s.name)).toEqual(['shift', 'freeze', 'vanish']);
  });

  it('should return correct skills for tactician class', () => {
    const skills = getSkillsForClass('tactician');

    expect(skills).toHaveLength(3);
    expect(skills.map(s => s.name)).toEqual(['doubleStep', 'shield', 'swap']);
  });

  it('should return skills with correct structure', () => {
    const skills = getSkillsForClass('disruptor');

    skills.forEach(skill => {
      expect(skill).toHaveProperty('name');
      expect(skill).toHaveProperty('mpCost');
      expect(skill).toHaveProperty('description');
      expect(skill).toHaveProperty('playerClass');
      expect(skill).toHaveProperty('validate');
      expect(skill).toHaveProperty('execute');
    });
  });

  it('should return skills with correct MP costs', () => {
    const disruptorSkills = getSkillsForClass('disruptor');
    const tacticianSkills = getSkillsForClass('tactician');

    // Check disruptor costs
    const shift = disruptorSkills.find(s => s.name === 'shift');
    expect(shift?.mpCost).toBe(3);

    const freeze = disruptorSkills.find(s => s.name === 'freeze');
    expect(freeze?.mpCost).toBe(3);

    const vanish = disruptorSkills.find(s => s.name === 'vanish');
    expect(vanish?.mpCost).toBe(5);

    // Check tactician costs
    const doubleStep = tacticianSkills.find(s => s.name === 'doubleStep');
    expect(doubleStep?.mpCost).toBe(2);

    const shield = tacticianSkills.find(s => s.name === 'shield');
    expect(shield?.mpCost).toBe(3);

    const swap = tacticianSkills.find(s => s.name === 'swap');
    expect(swap?.mpCost).toBe(4);
  });
});

describe('getSkillByName', () => {
  it('should return shift skill', () => {
    const skill = getSkillByName('shift');

    expect(skill.name).toBe('shift');
    expect(skill.mpCost).toBe(3);
    expect(skill.playerClass).toBe('disruptor');
  });

  it('should return freeze skill', () => {
    const skill = getSkillByName('freeze');

    expect(skill.name).toBe('freeze');
    expect(skill.mpCost).toBe(3);
    expect(skill.playerClass).toBe('disruptor');
  });

  it('should return vanish skill', () => {
    const skill = getSkillByName('vanish');

    expect(skill.name).toBe('vanish');
    expect(skill.mpCost).toBe(5);
    expect(skill.playerClass).toBe('disruptor');
  });

  it('should return doubleStep skill', () => {
    const skill = getSkillByName('doubleStep');

    expect(skill.name).toBe('doubleStep');
    expect(skill.mpCost).toBe(2);
    expect(skill.playerClass).toBe('tactician');
  });

  it('should return shield skill', () => {
    const skill = getSkillByName('shield');

    expect(skill.name).toBe('shield');
    expect(skill.mpCost).toBe(3);
    expect(skill.playerClass).toBe('tactician');
  });

  it('should return swap skill', () => {
    const skill = getSkillByName('swap');

    expect(skill.name).toBe('swap');
    expect(skill.mpCost).toBe(4);
    expect(skill.playerClass).toBe('tactician');
  });

  it('should throw error for invalid skill name', () => {
    expect(() => getSkillByName('invalid' as any)).toThrow('Skill not found');
  });
});

describe('getAllSkillNames', () => {
  it('should return all 6 skill names', () => {
    const names = getAllSkillNames();

    expect(names).toHaveLength(6);
    expect(names).toContain('shift');
    expect(names).toContain('freeze');
    expect(names).toContain('vanish');
    expect(names).toContain('doubleStep');
    expect(names).toContain('shield');
    expect(names).toContain('swap');
  });
});
