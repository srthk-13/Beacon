# Analytics Engine – Beacon

---

## 1. Velocity

velocity = completedStoryPoints / sprintDuration

Where:
- completedStoryPoints = sum of DONE tasks
- sprintDuration = number of days

---

## 2. Sprint Health Score

healthScore = 
  (completionRatio * 0.5) +
  (capacityUtilization * 0.3) +
  (riskInverse * 0.2)

Where:
completionRatio = completedStoryPoints / committedStoryPoints
capacityUtilization = totalAssignedPoints / totalCapacity
riskInverse = 1 - riskScore

Score scaled to 0–100.

---

## 3. Overload Detection

A user is overloaded if:

assignedStoryPoints > capacityPerSprint

---

## 4. Risk Score

riskScore = blockedTasks / totalTasks

Range: 0–1