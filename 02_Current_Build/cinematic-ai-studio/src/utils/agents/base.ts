/**
 * Agent System — Cinematic.AI v6.0 Automation Layer
 * 
 * Architecture:
 *   Agent (abstract base) → Concrete implementations (PromptEnhancer, TakeCurator, etc.)
 *   Registry (singleton) → manages agents lifecycle + execution
 *   EventBus (pub/sub) → optional future use for event-driven triggers
 * 
 * All agents run in browser context, calling external LLM/vision APIs as needed.
 */

/** Minimalist event bus for decoupled communication */
type EventHandler = (event: AutomationEvent) => Promise<void> | void;

class EventBusImpl {
  private listeners: Map<string, Set<EventHandler>> = new Map();

  subscribe(type: string, handler: EventHandler): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(handler);
    // Return unsubscribe fn
    return () => this.listeners.get(type)?.delete(handler);
  }

  emit(type: string, payload?: any): void {
    const handlers = this.listeners.get(type);
    if (!handlers) return;
    const event: AutomationEvent = { type, payload, timestamp: Date.now() };
    handlers.forEach(async (h) => {
      try { await h(event); } catch (err) { console.error(`[Agent] error in ${type}:`, err); }
    });
  }
}

export const EventBus = new EventBusImpl();

/** Context passed to agents when they run */
export interface AgentContext {
  shotId?: string;
  shot?: import("../types").Shot;
  characters: import("../types").Character[];
  locations: import("../types").Location[];
  apiKey?: string;
  config: AutomationConfig;
  store: import("../store").CinematicState; // read-only access
}

/** Base class for all automation agents */
export abstract class Agent {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  protected config: AutomationConfigPartial;

  constructor(
    id: string,
    name: string,
    description: string,
    config?: Partial<AutomationConfigPartial>
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.config = config ?? {};
  }

  /** Whether this agent should run given the current context */
  abstract isApplicable(context: AgentContext): boolean;

  /** Core logic - produces zero or more suggestions */
  abstract process(context: AgentContext): Promise<AgentResult[]>;

  /** Optional: confirm before applying (defaults to auto-confirm) */
  async confirm(_action: any): Promise<boolean> { return true; }

  setConfig(updates: Partial<AutomationConfigPartial>) {
    this.config = { ...this.config, ...updates };
  }

  isEnabled(): boolean {
    return (this.config as any).enabled ?? true;
  }
}

/** Result returned by an agent */
export interface AgentResult {
  agentId?: string;         // filled by AgentRegistry
  shotId: string;
  type: "prompt_enhancement" | "shot_suggestion" | "continuity_fix" | "take_rating";
  original: string;
  suggested: string;
  confidence: number; // 0-1
  reason: string;
  metadata?: Record<string, any>;
}

/** Global registry */
const agents: Agent[] = [];

export const AgentRegistry = {
  register(agent: Agent) {
    agents.push(agent);
    console.log(`[AgentRegistry] Registered "${agent.name}" (${agent.id})`);
  },

  getAll() {
    return [...agents];
  },

  getById(id: string) {
    return agents.find(a => a.id === id);
  },

  /** Run all applicable agents for given context */
  async runAll(context: AgentContext): Promise<AgentResult[]> {
    const results: AgentResult[] = [];
    for (const agent of agents) {
      if (!agent.isEnabled()) continue;
      if (!agent.isApplicable(context)) continue;
      try {
        const agentResults = await agent.process(context);
        results.push(...agentResults);
      } catch (err) {
        console.error(`[AgentRegistry] Agent ${agent.id} failed:`, err);
      }
    }
    return results;
  }
};

/** Type helpers for partial config per-agent */
type AutomationConfigPartial = {
  enabled?: boolean;
  confidenceThreshold?: number;
  level?: "light" | "moderate" | "aggressive";
};

/** AutomationEvent shape used by EventBus */
export interface AutomationEvent {
  type: string;
  payload?: any;
  timestamp: number;
}
