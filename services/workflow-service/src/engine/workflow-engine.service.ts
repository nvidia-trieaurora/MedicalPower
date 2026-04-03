import { Injectable, Logger } from '@nestjs/common';
import { WorkflowTemplateService } from '../workflow-template/workflow-template.service';
import { WorkflowRunService } from '../workflow-run/workflow-run.service';
import { TaskService } from '../task/task.service';
import { TaskStateMachine } from '../task/task-state-machine';

interface WorkflowNode {
  id: string;
  type: string;
  data: Record<string, any>;
}

interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  label?: string;
}

interface StateMachineDef {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

@Injectable()
export class WorkflowEngineService {
  private readonly logger = new Logger(WorkflowEngineService.name);

  constructor(
    private templateService: WorkflowTemplateService,
    private runService: WorkflowRunService,
    private taskService: TaskService,
    private stateMachine: TaskStateMachine,
  ) {}

  async startWorkflow(templateId: string, caseId: string): Promise<any> {
    const template = await this.templateService.findById(templateId);
    const def = template.stateMachineDef as unknown as StateMachineDef;

    const run = await this.runService.create({ templateId, caseId });
    this.logger.log(`Started workflow run ${run.id} for case ${caseId}`);

    const startNode = def.nodes.find((n) => n.type === 'start');
    if (!startNode) {
      this.logger.error('No start node found in workflow template');
      return run;
    }

    await this.advanceFromNode(run.id, caseId, def, startNode.id);
    return this.runService.findById(run.id);
  }

  async onTaskCompleted(runId: string, taskNodeId: string): Promise<void> {
    const run = await this.runService.findById(runId);
    const template = await this.templateService.findById(run.templateId);
    const def = template.stateMachineDef as unknown as StateMachineDef;

    await this.advanceFromNode(runId, run.caseId, def, taskNodeId);
  }

  private async advanceFromNode(runId: string, caseId: string, def: StateMachineDef, currentNodeId: string): Promise<void> {
    const outEdges = def.edges.filter((e) => e.source === currentNodeId);
    if (outEdges.length === 0) return;

    for (const edge of outEdges) {
      const targetNode = def.nodes.find((n) => n.id === edge.target);
      if (!targetNode) continue;

      switch (targetNode.type) {
        case 'task':
          await this.createTaskForNode(runId, caseId, targetNode);
          await this.runService.updateState(runId, targetNode.id);
          break;

        case 'condition':
          await this.evaluateCondition(runId, caseId, def, targetNode);
          break;

        case 'parallel':
          await this.handleParallel(runId, caseId, def, targetNode);
          break;

        case 'end':
          const finalStatus = targetNode.data.finalStatus || 'completed';
          await this.runService.complete(runId, finalStatus);
          this.logger.log(`Workflow run ${runId} completed with status: ${finalStatus}`);
          break;

        default:
          await this.advanceFromNode(runId, caseId, def, targetNode.id);
      }
    }
  }

  private async createTaskForNode(runId: string, caseId: string, node: WorkflowNode): Promise<void> {
    const slaDeadline = node.data.slaHours
      ? new Date(Date.now() + node.data.slaHours * 3600_000)
      : undefined;

    await this.taskService.create({
      caseId,
      workflowRunId: runId,
      type: node.data.taskType || 'annotate',
      priority: node.data.priority || 'normal',
      slaDeadline,
    });

    this.logger.log(`Created task "${node.data.label}" for workflow run ${runId}`);
  }

  private async evaluateCondition(runId: string, caseId: string, def: StateMachineDef, node: WorkflowNode): Promise<void> {
    const { field, operator, value } = node.data;
    const run = await this.runService.findById(runId);
    const context = (run.context as Record<string, any>) || {};
    const actual = context[field] ?? 0;

    let result = false;
    switch (operator) {
      case '>=': result = actual >= value; break;
      case '<=': result = actual <= value; break;
      case '>':  result = actual > value; break;
      case '<':  result = actual < value; break;
      case '==': result = actual == value; break;
      case '!=': result = actual != value; break;
    }

    this.logger.log(`Condition "${node.data.label}": ${field} ${operator} ${value} => ${result}`);

    const outEdges = def.edges.filter((e) => e.source === node.id);
    const yesEdge = outEdges.find((e) => e.sourceHandle === 'yes' || e.label?.includes('cao') || e.label?.includes('high'));
    const noEdge = outEdges.find((e) => e.sourceHandle === 'no' || e.label?.includes('thấp') || e.label?.includes('low'));
    const targetEdge = result ? (yesEdge || outEdges[0]) : (noEdge || outEdges[1] || outEdges[0]);

    if (targetEdge) {
      const targetNode = def.nodes.find((n) => n.id === targetEdge.target);
      if (targetNode) {
        await this.advanceFromNode(runId, caseId, def, node.id);
      }
    }
  }

  private async handleParallel(runId: string, caseId: string, def: StateMachineDef, node: WorkflowNode): Promise<void> {
    const minApprovals = node.data.minApprovals || 2;
    for (let i = 0; i < minApprovals; i++) {
      await this.taskService.create({
        caseId,
        workflowRunId: runId,
        type: 'review',
        priority: 'normal',
      });
    }

    await this.runService.updateState(runId, node.id);
    this.logger.log(`Created ${minApprovals} parallel review tasks for workflow run ${runId}`);
  }
}
