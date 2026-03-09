# Optimization Engine – Beacon

---

## 1. Priority Score Formula

priorityScore = 
  (businessValue * w1) +
  (riskFactor * w2) +
  (urgency * w3) -
  (storyPoints * w4)

Weights:
w1 = 0.4
w2 = 0.2
w3 = 0.2
w4 = 0.2

---

## 2. Capacity Constraint

TotalStoryPoints ≤ TotalTeamCapacity

If exceeded → reduce lowest priority tasks.

---

## 3. Sprint Feasibility

feasibilityScore = 
  totalCapacity / totalStoryPoints

If feasibilityScore < 1 → high risk

---

## 4. Optimization Strategy

1. Sort tasks by priorityScore (descending)
2. Add tasks until capacity limit reached
3. Remove lowest scoring tasks if overloaded
4. Return optimized set