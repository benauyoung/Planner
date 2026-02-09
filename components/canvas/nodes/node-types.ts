import { GoalNode } from './goal-node'
import { SubgoalNode } from './subgoal-node'
import { FeatureNode } from './feature-node'
import { TaskNode } from './task-node'
import { MoodboardNode } from './moodboard-node'
import { NotesNode } from './notes-node'
import { ConnectorNode } from './connector-node'

export const nodeTypes = {
  goal: GoalNode,
  subgoal: SubgoalNode,
  feature: FeatureNode,
  task: TaskNode,
  moodboard: MoodboardNode,
  notes: NotesNode,
  connector: ConnectorNode,
}
