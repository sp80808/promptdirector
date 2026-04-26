/**
 * Agent Registry — Central manager for all automation agents
 */

import { Agent } from './base';
import { AgentResult } from './base';
import { PromptEnhancerAgent } from './PromptEnhancerAgent';
import { TakeCuratorAgent } from './TakeCuratorAgent';

const agents: Agent[] = [];

export const AgentRegistry = {
  register(agent: Agent) {
    if (agents.some(a => a.id === agent.id)) {
      console.warn(`[AgentRegistry] Agent "${agent.id}" already registered, skipping`);
      return;
    }
    agents.push(agent);
    console.log(`[AgentRegistry] ✓ Registered agent: "${agent.name}" (${agent.id})`);
  },

  registerAll(...newAgents: Agent[]) {
    newAgents.forEach(a => this.register(a));
  },

  getAll(): Agent[] {
    return [...agents];
  },

  get<T extends Agent>(id: string): T | undefined {
    return agents.find(a => a.id === id) as T | undefined;
  },

  clear() {
    agents.length = 0;
  },

  async runAll(context: import('./base').AgentContext): Promise<AgentResult[]> {
    const results: AgentResult[] = [];
    
    for (const agent of agents) {
      if (!agent.isEnabled()) continue;
      if (!agent.isApplicable(context)) continue;

      try {
        const agentResults = await agent.process(context);
        const tagged = agentResults.map(r => ({ ...r, agentId: agent.id }));
        results.push(...tagged);
      } catch (err) {
        console.error(`[AgentRegistry] Agent "${agent.id}" threw:`, err);
      }
    }

    return results;
  },

  get count() {
    return agents.length;
  }
};

export function initializeDefaultAgents() {
  AgentRegistry.clear();
  
  // Register agents in priority order
  AgentRegistry.register(new PromptEnhancerAgent());
  AgentRegistry.register(new TakeCuratorAgent());
  
  // Future agents:
  // AgentRegistry.register(new ShotSuggestionAgent());
  // AgentRegistry.register(new ContinuityAgent());
  
  console.log(`[AgentRegistry] Initialized ${AgentRegistry.count} agent(s)`);
}


    agents.push(agent);
    console.log(`[AgentRegistry] ✓ Registered agent: "${agent.name}" (${agent.id})`);
  },

  /** Register multiple agents at once */
  registerAll(...newAgents: Agent[]) {
    newAgents.forEach(a => this.register(a));
  },

  /** Get all registered agents */
  getAll(): Agent[] {
    return [...agents];
  },

  /** Get agent by ID */
  get<T extends Agent>(id: string): T | undefined {
    return agents.find(a => a.id === id) as T | undefined;
  },

  /** Clear all agents (mainly for testing) */
  clear() {
    agents.length = 0;
  },

  /**
   * Execute all applicable agents for the given context
   * Returns aggregated results
   */
  async runAll(context: import('./base').AgentContext): Promise<AgentResult[]> {
    const results: AgentResult[] = [];
    
    for (const agent of agents) {
      if (!agent.isEnabled()) {
        continue;
      }
      
      if (!agent.isApplicable(context)) {
        continue;
      }

      try {
        const agentResults = await agent.process(context);
        // Tag each result with the agent that produced it
        (agentResults as any).forEach((r: AgentResult) => { r.agentId = agent.id; });
        results.push(...agentResults);
      } catch (err) {
        console.error(`[AgentRegistry] Agent "${agent.id}" threw:`, err);
      }
    }

    return results;
  },

  /** Get count of registered agents */
  get count() {
    return agents.length;
  }
};

/** Initialize default agents (call once on app start) */
export function initializeDefaultAgents() {
  AgentRegistry.clear();
  
  // Import lazily to avoid circular dependencies
  const { PromptEnhancerAgent } = require('./PromptEnhancerAgent');
  AgentRegistry.register(new PromptEnhancerAgent());
  
  // Future agents:
  // AgentRegistry.register(new TakeCuratorAgent());
  // AgentRegistry.register(new ShotSuggestionAgent());
  // AgentRegistry.register(new ContinuityAgent());
  
  console.log(`[AgentRegistry] Initialized ${AgentRegistry.count} agent(s)`);
}
