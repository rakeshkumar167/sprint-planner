import { useMemo, useState } from 'react';
import './App.css';

function IconHoliday({ size = 12 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function IconAlert({ size = 14 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

const SAMPLE_SPRINTS = `1|2026-04-27|2026-05-08
2|2026-05-11|2026-05-22
3|2026-05-25|2026-06-05
4|2026-06-08|2026-06-19
5|2026-06-22|2026-07-03
6|2026-07-06|2026-07-17`;

const SAMPLE_TASKS = `Alice|Auth service refactor|1,2
Alice|API rate limiting|3,4
Alice|SSO integration|5,6
Bob|Checkout redesign|1
Bob|Payment webhook migration|2,3,4
Bob|Refund flow|5,6
Carol|Analytics dashboard|1,2,3
Carol|On-call rotation|4
Carol|Reporting exports|5,6
Dan|Onboarding flow|1,2
Dan|Mobile push notifications|3,4
Dan|Deep links|5,6
Eve|Design system upgrade|1,2,3
Eve|Accessibility audit|4,5
Eve|Marketing site refresh|6
Frank|Data pipeline migration|1,2,3,4
Frank|ETL monitoring|5,6
Grace|Search relevance|1,2
Grace|Query autocomplete|3,4
Grace|Personalization|5,6
Henry|Kubernetes upgrade|1,2
Henry|Observability stack|3,4,5
Henry|Secrets rotation|6
Ivy|Customer support tooling|1,2,3
Ivy|Ticket triage bot|4,5,6
Jack|Billing invoices|1,2
Jack|Tax calculation|3,4
Jack|Subscription lifecycle|5,6
Karen|iOS release 4.2|1,2
Karen|Android release 4.2|3,4
Karen|Crash reporting|5,6
Leo|Security audit|1,2,3
Leo|Pen test remediation|4,5
Leo|SOC2 evidence|6
Mia|Internal tools|1,2
Mia|Admin portal|3,4,5
Mia|Audit logs|6
Noah|Docs rewrite|1,2
Noah|API reference|3,4
Noah|Video tutorials|5,6
Olivia|Growth experiments|1,2,3
Olivia|Referral program|4,5,6`;

const SAMPLE_HOLIDAYS = `Alice|2026-05-04
Bob|2026-05-26,2026-05-27
Carol|2026-06-10
Dan|2026-05-15
Eve|2026-07-03
Frank|2026-05-25,2026-05-26
Grace|2026-06-29,2026-06-30,2026-07-01
Henry|2026-05-11
Ivy|2026-07-10
Jack|2026-06-05
Karen|2026-05-18,2026-05-19
Leo|2026-06-22
Mia|2026-07-13,2026-07-14
Noah|2026-04-30
Olivia|2026-06-15,2026-06-16`;

const TASK_PALETTE = [
  { bg: 'linear-gradient(135deg,#e0e7ff,#c7d2fe)', fg: '#3730a3' },
  { bg: 'linear-gradient(135deg,#ffedd5,#fed7aa)', fg: '#9a3412' },
  { bg: 'linear-gradient(135deg,#ccfbf1,#a5f3fc)', fg: '#115e59' },
  { bg: 'linear-gradient(135deg,#fce7f3,#fbcfe8)', fg: '#9d174d' },
  { bg: 'linear-gradient(135deg,#dcfce7,#d9f99d)', fg: '#166534' },
  { bg: 'linear-gradient(135deg,#ffe4e6,#fecdd3)', fg: '#9f1239' },
  { bg: 'linear-gradient(135deg,#ede9fe,#ddd6fe)', fg: '#5b21b6' },
  { bg: 'linear-gradient(135deg,#e0f2fe,#bae6fd)', fg: '#075985' },
  { bg: 'linear-gradient(135deg,#fef9c3,#fef08a)', fg: '#854d0e' },
  { bg: 'linear-gradient(135deg,#e0e7ff,#a5b4fc)', fg: '#3730a3' },
];

function parseSprints(text) {
  const rows = [];
  const errors = [];
  text.split('\n').forEach((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    const parts = trimmed.split('|').map((p) => p.trim());
    if (parts.length !== 3) {
      errors.push(`Sprint line ${idx + 1}: expected "number|start|end"`);
      return;
    }
    const num = Number(parts[0]);
    const start = new Date(parts[1]);
    const end = new Date(parts[2]);
    if (Number.isNaN(num) || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      errors.push(`Sprint line ${idx + 1}: invalid number or dates`);
      return;
    }
    rows.push({ number: num, start, end });
  });
  rows.sort((a, b) => a.number - b.number);
  return { sprints: rows, errors };
}

function parseTasks(text) {
  const rows = [];
  const errors = [];
  text.split('\n').forEach((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    const parts = trimmed.split('|').map((p) => p.trim());
    if (parts.length !== 3) {
      errors.push(`Task line ${idx + 1}: expected "Person|Task|sprint,numbers"`);
      return;
    }
    const [person, task, sprintList] = parts;
    const sprintNums = sprintList
      .split(',')
      .map((s) => Number(s.trim()))
      .filter((n) => !Number.isNaN(n));
    if (!person || !task || sprintNums.length === 0) {
      errors.push(`Task line ${idx + 1}: missing person, task, or sprint numbers`);
      return;
    }
    rows.push({ person, task, sprints: sprintNums });
  });
  return { tasks: rows, errors };
}

function parseHolidays(text) {
  const map = new Map();
  const errors = [];
  text.split('\n').forEach((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    const parts = trimmed.split('|').map((p) => p.trim());
    if (parts.length !== 2) {
      errors.push(`Holiday line ${idx + 1}: expected "Person|date,date"`);
      return;
    }
    const [person, dateList] = parts;
    const dates = dateList
      .split(',')
      .map((d) => d.trim())
      .filter(Boolean);
    if (!map.has(person)) map.set(person, new Set());
    dates.forEach((d) => {
      if (Number.isNaN(new Date(d).getTime())) {
        errors.push(`Holiday line ${idx + 1}: bad date "${d}"`);
      } else {
        map.get(person).add(d);
      }
    });
  });
  return { holidays: map, errors };
}

function fmtDate(d) {
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function workingDaysInSprint(sprint) {
  let count = 0;
  const d = new Date(sprint.start);
  while (d <= sprint.end) {
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) count += 1;
    d.setDate(d.getDate() + 1);
  }
  return count;
}

function holidayDaysInSprint(person, sprint, holidays) {
  const dates = holidays.get(person);
  if (!dates) return 0;
  let count = 0;
  dates.forEach((d) => {
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return;
    const dow = dt.getDay();
    if (dow === 0 || dow === 6) return;
    if (dt >= sprint.start && dt <= sprint.end) count += 1;
  });
  return count;
}

function groupRuns(sprintNums, allSprintNums) {
  const sorted = [...new Set(sprintNums)].sort((a, b) => a - b);
  const runs = [];
  let cur = [];
  sorted.forEach((n) => {
    if (!allSprintNums.includes(n)) return;
    if (cur.length === 0) {
      cur = [n];
    } else if (allSprintNums.indexOf(n) === allSprintNums.indexOf(cur[cur.length - 1]) + 1) {
      cur.push(n);
    } else {
      runs.push(cur);
      cur = [n];
    }
  });
  if (cur.length) runs.push(cur);
  return runs;
}

function hashColor(key) {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return TASK_PALETTE[h % TASK_PALETTE.length];
}

export default function App() {
  const [sprintsText, setSprintsText] = useState(SAMPLE_SPRINTS);
  const [tasksText, setTasksText] = useState(SAMPLE_TASKS);
  const [holidaysText, setHolidaysText] = useState(SAMPLE_HOLIDAYS);

  const { sprints, sprintErrors } = useMemo(() => {
    const r = parseSprints(sprintsText);
    return { sprints: r.sprints, sprintErrors: r.errors };
  }, [sprintsText]);

  const { tasks, taskErrors } = useMemo(() => {
    const r = parseTasks(tasksText);
    return { tasks: r.tasks, taskErrors: r.errors };
  }, [tasksText]);

  const { holidays, holidayErrors } = useMemo(() => {
    const r = parseHolidays(holidaysText);
    return { holidays: r.holidays, holidayErrors: r.errors };
  }, [holidaysText]);

  const sprintNums = sprints.map((s) => s.number);

  const people = useMemo(() => {
    const set = new Set();
    tasks.forEach((t) => set.add(t.person));
    holidays.forEach((_, p) => set.add(p));
    return [...set];
  }, [tasks, holidays]);

  const rowsByPerson = useMemo(() => {
    const map = new Map();
    people.forEach((p) => map.set(p, []));
    tasks.forEach((t) => {
      if (!map.has(t.person)) map.set(t.person, []);
      const runs = groupRuns(t.sprints, sprintNums);
      runs.forEach((run) => {
        map.get(t.person).push({
          task: t.task,
          startSprint: run[0],
          span: run.length,
          color: hashColor(t.task),
        });
      });
    });
    return map;
  }, [tasks, people, sprintNums]);

  const holidaysInSprint = (person, sprint) => {
    const dates = holidays.get(person);
    if (!dates) return [];
    return [...dates].filter((d) => {
      const dt = new Date(d);
      return dt >= sprint.start && dt <= sprint.end;
    });
  };

  const taskGantt = useMemo(() => {
    const byTask = new Map();
    const order = [];
    tasks.forEach((t) => {
      if (!byTask.has(t.task)) {
        byTask.set(t.task, { task: t.task, people: new Set(), sprints: new Set() });
        order.push(t.task);
      }
      const rec = byTask.get(t.task);
      rec.people.add(t.person);
      t.sprints.forEach((n) => rec.sprints.add(n));
    });
    return order.map((name) => {
      const rec = byTask.get(name);
      return {
        task: name,
        people: [...rec.people],
        runs: groupRuns([...rec.sprints], sprintNums),
        color: hashColor(name),
      };
    });
  }, [tasks, sprintNums]);

  const effort = useMemo(() => {
    const sprintByNum = new Map(sprints.map((s) => [s.number, s]));
    const byTask = new Map();
    tasks.forEach((t) => {
      let personDays = 0;
      t.sprints.forEach((n) => {
        const sp = sprintByNum.get(n);
        if (!sp) return;
        const wd = workingDaysInSprint(sp);
        const hd = holidayDaysInSprint(t.person, sp, holidays);
        personDays += Math.max(0, wd - hd);
      });
      if (!byTask.has(t.task)) byTask.set(t.task, { task: t.task, total: 0, contributors: [], color: hashColor(t.task) });
      const rec = byTask.get(t.task);
      rec.total += personDays;
      rec.contributors.push({ person: t.person, days: personDays });
    });
    return [...byTask.values()].sort((a, b) => b.total - a.total);
  }, [tasks, sprints, holidays]);

  const allErrors = [...sprintErrors, ...taskErrors, ...holidayErrors];

  return (
    <div className="app">
      <header className="hero">
        <h1>Sprint Planner</h1>
        <p>Plan people across sprints. Paste structured lines, see a calendar.</p>
      </header>

      <section className="inputs">
        <div className="card">
          <label>Sprint calendar <span className="hint">number | start | end</span></label>
          <textarea
            value={sprintsText}
            onChange={(e) => setSprintsText(e.target.value)}
            rows={5}
            spellCheck={false}
          />
        </div>
        <div className="card">
          <label>Tasks <span className="hint">Person | Task | sprint,numbers</span></label>
          <textarea
            value={tasksText}
            onChange={(e) => setTasksText(e.target.value)}
            rows={9}
            spellCheck={false}
          />
        </div>
        <div className="card">
          <label>Holidays <span className="hint">Person | YYYY-MM-DD, YYYY-MM-DD</span></label>
          <textarea
            value={holidaysText}
            onChange={(e) => setHolidaysText(e.target.value)}
            rows={5}
            spellCheck={false}
          />
        </div>
      </section>

      {allErrors.length > 0 && (
        <div className="errors">
          {allErrors.map((e, i) => (
            <div key={i} className="error-line">
              <IconAlert />
              <span>{e}</span>
            </div>
          ))}
        </div>
      )}

      <section className="timeline">
        <div className="timeline-scroll">
          <table>
            <thead>
              <tr>
                <th className="person-col">Person</th>
                {sprints.map((s) => (
                  <th key={s.number} className="sprint-col">
                    <div className="sprint-num">Sprint {s.number}</div>
                    <div className="sprint-dates">
                      {fmtDate(s.start)} – {fmtDate(s.end)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {people.flatMap((person) => {
                const segments = (rowsByPerson.get(person) || [])
                  .slice()
                  .sort((a, b) => a.startSprint - b.startSprint);

                const lanes = [];
                segments.forEach((seg) => {
                  const lane = lanes.find((l) => {
                    const last = l[l.length - 1];
                    return last.startSprint + last.span <= seg.startSprint;
                  });
                  if (lane) lane.push(seg);
                  else lanes.push([seg]);
                });
                if (lanes.length === 0) lanes.push([]);

                return lanes.map((laneSegs, laneIdx) => {
                  const cells = [];
                  let i = 0;
                  while (i < sprints.length) {
                    const s = sprints[i];
                    const seg = laneSegs.find((x) => x.startSprint === s.number);
                    if (seg) {
                      const hols = [];
                      for (let k = 0; k < seg.span; k++) {
                        const sp = sprints[i + k];
                        if (sp) hols.push(...holidaysInSprint(person, sp));
                      }
                      cells.push(
                        <td
                          key={`${person}-${laneIdx}-${s.number}`}
                          colSpan={seg.span}
                          className="task-cell"
                        >
                          <div
                            className="task-chip"
                            style={{ background: seg.color.bg, color: seg.color.fg }}
                            title={`${seg.task} · ${seg.span} sprint${seg.span > 1 ? 's' : ''}${hols.length > 0 ? ` · ${hols.length} holiday${hols.length > 1 ? 's' : ''}` : ''}`}
                          >
                            <span className="task-title">{seg.task}</span>
                            <span className="task-meta">
                              {seg.span}s
                              {hols.length > 0 && (
                                <>
                                  {' · '}
                                  <IconHoliday size={11} />
                                  {hols.length}
                                </>
                              )}
                            </span>
                          </div>
                        </td>
                      );
                      i += seg.span;
                    } else {
                      const hols = laneIdx === 0 ? holidaysInSprint(person, s) : [];
                      cells.push(
                        <td key={`${person}-${laneIdx}-${s.number}`} className="empty-cell">
                          {hols.length > 0 ? (
                            <div className="holiday-chip" title={hols.join(', ')}>
                              <IconHoliday />
                              {hols.length} off
                            </div>
                          ) : (
                            <span className="muted">—</span>
                          )}
                        </td>
                      );
                      i += 1;
                    }
                  }
                  return (
                    <tr key={`${person}-${laneIdx}`} className={laneIdx > 0 ? 'lane-extra' : ''}>
                      {laneIdx === 0 ? (
                        <td className="person-col name" rowSpan={lanes.length}>
                          {person}
                        </td>
                      ) : null}
                      {cells}
                    </tr>
                  );
                });
              })}
              {people.length === 0 && (
                <tr>
                  <td className="empty" colSpan={sprints.length + 1}>
                    Add a task above to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="effort">
        <h2 className="effort-title">Task delivery Gantt</h2>
        <p className="effort-sub">
          One row per task. Bars show the sprint window in which the task is being delivered (union across all contributors). Gaps split into separate runs.
        </p>
        <div className="timeline">
          <div className="timeline-scroll">
            <table>
              <thead>
                <tr>
                  <th className="task-col">Task</th>
                  {sprints.map((s) => (
                    <th key={s.number} className="sprint-col">
                      <div className="sprint-num">Sprint {s.number}</div>
                      <div className="sprint-dates">
                        {fmtDate(s.start)} – {fmtDate(s.end)}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {taskGantt.map((row) => {
                  const runByStart = new Map();
                  row.runs.forEach((run) => runByStart.set(run[0], run));
                  const cells = [];
                  let i = 0;
                  while (i < sprints.length) {
                    const s = sprints[i];
                    const run = runByStart.get(s.number);
                    if (run) {
                      const span = run.length;
                      const title = `${row.task} · sprints ${run[0]}–${run[run.length - 1]} · ${row.people.length} contributor${row.people.length === 1 ? '' : 's'}`;
                      cells.push(
                        <td key={`${row.task}-${s.number}`} colSpan={span} className="task-cell">
                          <div
                            className="task-chip"
                            style={{ background: row.color.bg, color: row.color.fg }}
                            title={title}
                          >
                            <span className="task-title">{row.task}</span>
                            <span className="task-meta">{span}s · {row.people.length}p</span>
                          </div>
                        </td>
                      );
                      i += span;
                    } else {
                      cells.push(
                        <td key={`${row.task}-${s.number}`} className="empty-cell">
                          <span className="muted">—</span>
                        </td>
                      );
                      i += 1;
                    }
                  }
                  return (
                    <tr key={row.task}>
                      <td className="task-col name">
                        <span className="task-swatch" style={{ background: row.color.bg }} />
                        <span className="gantt-task-name">
                          <span className="gantt-task-title">{row.task}</span>
                          {row.people.length > 0 && (
                            <span className="gantt-contribs">{row.people.join(', ')}</span>
                          )}
                        </span>
                      </td>
                      {cells}
                    </tr>
                  );
                })}
                {(taskGantt.length === 0 || sprints.length === 0) && (
                  <tr>
                    <td className="empty" colSpan={sprints.length + 1}>
                      Add tasks and sprints to see the Gantt.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="effort">
        <h2 className="effort-title">Effort estimate per task</h2>
        <p className="effort-sub">
          Person-days per task, summed across contributors. Working days = weekdays in each sprint minus that person's holidays.
        </p>
        <div className="timeline">
          <div className="timeline-scroll">
            <table className="effort-table">
              <thead>
                <tr>
                  <th className="effort-task-col">Task</th>
                  <th className="effort-total-col">Total days</th>
                  <th className="effort-bar-col">Relative effort</th>
                </tr>
              </thead>
              <tbody>
                {effort.map((e) => {
                  const max = effort[0]?.total || 1;
                  const pct = Math.max(2, (e.total / max) * 100);
                  return (
                    <tr key={e.task}>
                      <td className="effort-task">
                        <span
                          className="task-swatch"
                          style={{ background: e.color.bg }}
                        />
                        {e.task}
                      </td>
                      <td className="effort-total">
                        <div className="effort-total-row">
                          <span className="effort-total-num">{e.total}d</span>
                          <div className="effort-contribs">
                            {e.contributors.map((c, i) => (
                              <span key={i} className="contrib-pill">
                                {c.person} <b>{c.days}d</b>
                              </span>
                            ))}
                          </div>
                        </div>
                      </td>
                      <td className="effort-bar-cell">
                        <div className="effort-bar-track">
                          <div
                            className="effort-bar-fill"
                            style={{ width: `${pct}%`, background: e.color.bg }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {effort.length === 0 && (
                  <tr>
                    <td className="empty" colSpan={3}>
                      Add tasks and sprints to compute effort.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <footer className="foot">
        {people.length} people · {tasks.length} tasks · {sprints.length} sprints
      </footer>
    </div>
  );
}
