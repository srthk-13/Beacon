import { useEffect, useState } from 'react'
import Card from '../components/common/Card'
import { getAnalyticsHub } from '../api/beaconApi'

function Analytics() {
  const [data, setData] = useState(null)

  useEffect(() => {
    let active = true

    getAnalyticsHub().then((response) => {
      if (active) {
        setData(response.data)
      }
    })

    return () => {
      active = false
    }
  }, [])

  if (!data) {
    return <div className="loading-copy">Loading analytics...</div>
  }

  return (
    <div className="page-grid">
      <section className="hero-panel compact-hero">
        <p className="eyebrow">Analytics engine</p>
        <h1>Delivery intelligence across velocity, risk, and capacity.</h1>
        <p className="section-copy">
          These values are derived from the formulas documented for Beacon&apos;s analytics and optimization layers.
        </p>
      </section>

      <section className="stats-grid three-up-grid">
        {data.projectCards.map((project) => (
          <Card key={project.id}>
            <p className="eyebrow">Project analytics</p>
            <h3>{project.name}</h3>
            <div className="info-stack compact-stack">
              <div>
                <span>Average velocity</span>
                <strong>{project.averageVelocity}</strong>
              </div>
              <div>
                <span>Total sprints</span>
                <strong>{project.totalSprints}</strong>
              </div>
              <div>
                <span>Latest health</span>
                <strong>{project.latestHealthScore}%</strong>
              </div>
            </div>
          </Card>
        ))}
      </section>

      <section className="two-column-grid analytics-grid">
        <Card>
          <p className="eyebrow">Sprint analytics</p>
          <div className="mini-list">
            {data.sprintCards.map((sprint) => (
              <div key={sprint.id} className="mini-list-item">
                <div className="split-line">
                  <strong>{sprint.name}</strong>
                  <span className="status-chip">{sprint.status}</span>
                </div>
                <p>Velocity {sprint.velocity} pts/day</p>
                <p>Health {sprint.healthScore}%</p>
                <p>Risk score {sprint.riskScore}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <p className="eyebrow">Workload balance</p>
          <div className="mini-list">
            {data.overload.map((member) => (
              <div key={member.id} className="mini-list-item">
                <div className="split-line">
                  <strong>{member.name}</strong>
                  <span className={`status-chip${member.overloaded ? ' risk-chip' : ''}`}>
                    {member.overloaded ? 'Overloaded' : 'Balanced'}
                  </span>
                </div>
                <p>{member.role}</p>
                <div className="progress-meta">
                  <span>
                    {member.assignedStoryPoints} / {member.capacityPerSprint} pts
                  </span>
                  <strong>{Math.round((member.assignedStoryPoints / member.capacityPerSprint) * 100)}%</strong>
                </div>
                <div className="progress-bar subtle-progress">
                  <span style={{ width: `${Math.min(100, Math.round((member.assignedStoryPoints / member.capacityPerSprint) * 100))}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  )
}

export default Analytics
