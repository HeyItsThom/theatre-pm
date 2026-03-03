'use client';
import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

// ─── Supabase client ──────────────────────────────────────────────────────────
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// ─── Utilities ────────────────────────────────────────────────────────────────
const fmt = (d) => d ? new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
const todayStr = () => new Date().toISOString().slice(0, 10);
const isOverdue = (d) => d && new Date(d + 'T00:00:00') < new Date(new Date().toDateString());
const daysLeft = (d) => {
  if (!d) return null;
  return Math.ceil((new Date(d + 'T00:00:00') - new Date(new Date().toDateString())) / 86400000);
};

// ─── Load-In Template ─────────────────────────────────────────────────────────
const LOAD_IN_TEMPLATE = [
  { title: 'Prep & Pre-Production', items: [
    { title: 'Pre-Production', tasks: [
      { title: 'Read script & attend design meetings' },
      { title: 'Review lighting design & plot' },
      { title: 'Prepare equipment list' },
      { title: 'Order / hire additional equipment' },
      { title: 'Check all hired gear on delivery' },
    ]},
    { title: 'Paperwork', tasks: [
      { title: 'Receive & review channel hookup' },
      { title: 'Receive & review patch schedule' },
      { title: 'Prepare dimmer schedule' },
      { title: 'Prepare colour / gel cut list' },
      { title: 'Risk assessment completed & signed' },
    ]},
  ]},
  { title: 'Hang', items: [
    { title: 'Grid', tasks: [
      { title: 'Check grid access & safety', notes: 'Confirm PASMA / working at height certs' },
      { title: 'Rig grid bars to plot' },
      { title: 'Safety bond all units', notes: '100% bond policy' },
      { title: 'Hang colour / gobos to gel list' },
      { title: 'Cable grid positions' },
    ]},
    { title: 'Catwalk', tasks: [
      { title: 'Rig catwalk positions to plot' },
      { title: 'Safety bond all units' },
      { title: 'Cable catwalk runs' },
    ]},
    { title: 'FOH / Auditorium', tasks: [
      { title: 'Rig circle bar / front of house positions' },
      { title: 'Safety bond all units' },
      { title: 'Cable FOH positions' },
    ]},
    { title: 'Back of House', tasks: [
      { title: 'Rig BOH practicals & specials' },
      { title: 'Cable BOH positions' },
    ]},
    { title: 'Advance & Boom Positions', tasks: [
      { title: 'Rig advance bar' },
      { title: 'Rig boom arms' },
      { title: 'Safety bond all boom units' },
      { title: 'Cable booms' },
    ]},
  ]},
  { title: 'Practicals', items: [
    { title: 'Window Light Boxes', tasks: [
      { title: 'LED tape install' },
      { title: 'Equipment install & bracket' },
      { title: 'Cable run & tidy' },
      { title: 'Test & sign off' },
    ]},
    { title: 'Table Lamps', tasks: [
      { title: 'Bulb install', notes: 'Check wattage against prop list' },
      { title: 'Equipment fit & cable' },
      { title: 'Test & sign off' },
    ]},
    { title: 'Practical Wall Lights / Sconces', tasks: [
      { title: 'Fit & cable' },
      { title: 'Test & sign off' },
    ]},
    { title: 'Neon / Signage', tasks: [
      { title: 'Install & secure' },
      { title: 'Cable & test' },
    ]},
  ]},
  { title: 'Dimmers & Data', items: [
    { title: 'Dimmer Rack', tasks: [
      { title: 'Dimmer rack positioning & installation' },
      { title: 'Mains supply confirmed & signed off', notes: 'Requires qualified electrician sign-off' },
      { title: 'Patch & address dimmers to hookup' },
      { title: 'Test all circuits — full load test' },
    ]},
    { title: 'Network & DMX', tasks: [
      { title: 'Run DMX / data cables' },
      { title: 'Install & configure network switches' },
      { title: 'Universe map agreed with LD' },
      { title: 'Test all data runs' },
    ]},
    { title: 'Moving Lights', tasks: [
      { title: 'Address all moving lights' },
      { title: 'Test pan/tilt/colour/gobo' },
      { title: 'Home all fixtures' },
    ]},
  ]},
  { title: 'Focus & Plot', items: [
    { title: 'Focus Session', tasks: [
      { title: 'Focus session scheduled with LD' },
      { title: 'Focus all generic fixtures' },
      { title: 'Focus all moving lights' },
      { title: 'Focus practicals & specials' },
      { title: 'Record focus notes / positions' },
    ]},
    { title: 'Console', tasks: [
      { title: 'Desk positioned & powered' },
      { title: 'Showfile loaded & backed up' },
      { title: 'All channels tested from desk' },
      { title: 'Submasters / playbacks set up' },
    ]},
  ]},
  { title: 'Rehearsals & Technical', items: [
    { title: 'Tech Prep', tasks: [
      { title: 'Sitzprobe / stagger-through notes actioned' },
      { title: 'All rigging checks completed pre-tech' },
      { title: 'On-call crew briefed' },
    ]},
    { title: 'Tech & Dress', tasks: [
      { title: 'Technical rehearsal support' },
      { title: 'Dress rehearsal support' },
      { title: 'Notes session after each run' },
      { title: 'Preview notes actioned' },
    ]},
  ]},
  { title: 'Opening & Run', items: [
    { title: 'Opening Night', tasks: [
      { title: 'Full rig check completed' },
      { title: 'Spare lamps / gels stocked' },
      { title: 'On-call crew confirmed for run' },
    ]},
    { title: 'Show Run Maintenance', tasks: [
      { title: 'Daily pre-show checklist completed' },
      { title: 'Weekly rig inspection' },
      { title: 'Replacement schedule maintained' },
    ]},
  ]},
  { title: 'Get-Out', items: [
    { title: 'De-rig', tasks: [
      { title: 'All fixtures de-rigged safely' },
      { title: 'All cable coiled & labelled' },
      { title: 'Colour / gels removed & sorted' },
      { title: 'Hired equipment returned — checked against delivery note' },
      { title: 'Own stock returned to store — inventory updated' },
    ]},
    { title: 'Closeout', tasks: [
      { title: 'Dimmer rack disconnected & removed' },
      { title: 'Venue electrical systems returned to house state' },
      { title: 'Post-show report written' },
      { title: 'Lessons learned / handover notes completed' },
    ]},
  ]},
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const calcProgress = (tasks) => !tasks.length ? 0 : Math.round((tasks.filter(t => t.done).length / tasks.length) * 100);

const ProgressBar = ({ pct, size = 'md' }) => {
  const h = size === 'sm' ? 'h-1.5' : size === 'lg' ? 'h-3' : 'h-2';
  const color = pct === 100 ? '#2ecc71' : pct > 60 ? '#3498db' : pct > 30 ? '#f39c12' : '#e74c3c';
  return (
    <div className="flex items-center gap-2">
      <div className={`flex-1 bg-gray-700 rounded-full overflow-hidden ${h}`}>
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs text-gray-400 w-8 text-right">{pct}%</span>
    </div>
  );
};

const Avatar = ({ member }) => (
  <div className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 text-xs"
    style={{ backgroundColor: member.color }} title={member.name}>
    {member.name.split(' ').map(n => n[0]).join('')}
  </div>
);

const Badge = ({ children, color = 'gray' }) => {
  const colors = { gray: 'bg-gray-700 text-gray-300', green: 'bg-green-900 text-green-300', red: 'bg-red-900 text-red-300', yellow: 'bg-yellow-900 text-yellow-300' };
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[color]}`}>{children}</span>;
};

const PriorityBadge = ({ priority }) => {
  if (!priority || priority === 'medium') return null;
  if (priority === 'high') return <Badge color="red">↑ High</Badge>;
  return <Badge color="gray">↓ Low</Badge>;
};

const DeadlineBadge = ({ deadline, done }) => {
  if (!deadline) return null;
  if (done) return <Badge color="green">✓ Done</Badge>;
  const d = daysLeft(deadline);
  if (d < 0) return <Badge color="red">⚠ {Math.abs(d)}d overdue</Badge>;
  if (d === 0) return <Badge color="yellow">Due today</Badge>;
  if (d <= 3) return <Badge color="yellow">{d}d left</Badge>;
  return <Badge color="gray">{fmt(deadline)}</Badge>;
};

const Modal = ({ title, onClose, children, wide = false }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}>
    <div className={`bg-gray-800 rounded-xl shadow-2xl w-full border border-gray-700 ${wide ? 'max-w-2xl' : 'max-w-lg'}`}>
      <div className="flex items-center justify-between p-5 border-b border-gray-700">
        <h2 className="text-lg font-bold text-white">{title}</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl w-8 h-8 flex items-center justify-center">×</button>
      </div>
      <div className="p-5 max-h-[80vh] overflow-y-auto">{children}</div>
    </div>
  </div>
);

const ConfirmModal = ({ message, onConfirm, onClose }) => (
  <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
    <div className="bg-gray-800 rounded-xl w-full max-w-sm border border-gray-700 p-6">
      <p className="text-white text-center mb-6">{message}</p>
      <div className="flex gap-3">
        <button onClick={onClose} className="flex-1 px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium">Cancel</button>
        <button onClick={() => { onConfirm(); onClose(); }} className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-medium">Delete</button>
      </div>
    </div>
  </div>
);

const SHOW_COLORS = ['#e74c3c','#3498db','#2ecc71','#9b59b6','#f39c12','#1abc9c','#e91e63','#ff5722'];
const MEMBER_COLORS = ['#3498db','#2ecc71','#9b59b6','#f39c12','#e74c3c','#1abc9c','#e91e63','#ff5722'];

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [shows, setShows] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('shows');
  const [activeShowId, setActiveShowId] = useState(null);
  const [expandedCats, setExpandedCats] = useState({});
  const [expandedItems, setExpandedItems] = useState({});
  const [modal, setModal] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [filterMember, setFilterMember] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [saving, setSaving] = useState(false);

  // ── Load all data ──────────────────────────────────────────────────────────
  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [showsRes, membersRes, catsRes, subsRes, tasksRes, assigneesRes] = await Promise.all([
        supabase.from('shows').select('*').order('created_at'),
        supabase.from('members').select('*').order('created_at'),
        supabase.from('categories').select('*').order('sort_order'),
        supabase.from('subcategories').select('*').order('sort_order'),
        supabase.from('tasks').select('*').order('sort_order'),
        supabase.from('task_assignees').select('*'),
      ]);

      const taskAssigneeMap = {};
      (assigneesRes.data || []).forEach(a => {
        if (!taskAssigneeMap[a.task_id]) taskAssigneeMap[a.task_id] = [];
        taskAssigneeMap[a.task_id].push(a.member_id);
      });

      const tasksWithAssignees = (tasksRes.data || []).map(t => ({ ...t, assignees: taskAssigneeMap[t.id] || [] }));
      const subMap = {};
      (subsRes.data || []).forEach(s => {
        if (!subMap[s.category_id]) subMap[s.category_id] = [];
        subMap[s.category_id].push({ ...s, tasks: tasksWithAssignees.filter(t => t.subcategory_id === s.id) });
      });
      const catMap = {};
      (catsRes.data || []).forEach(c => {
        if (!catMap[c.show_id]) catMap[c.show_id] = [];
        catMap[c.show_id].push({ ...c, items: subMap[c.id] || [] });
      });
      setShows((showsRes.data || []).map(s => ({ ...s, categories: catMap[s.id] || [] })));
      setMembers(membersRes.data || []);
    } catch (e) {
      console.error('Load error', e);
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const withSaving = async (fn) => { setSaving(true); await fn(); setSaving(false); };
  const askConfirm = (message, onConfirm) => setConfirm({ message, onConfirm });
  const getMember = (id) => members.find(m => m.id === id);
  const activeShow = shows.find(s => s.id === activeShowId);

  // ── Show CRUD ──────────────────────────────────────────────────────────────
  const createShow = async (form, useTemplate) => {
    await withSaving(async () => {
      const { data: show } = await supabase.from('shows').insert({ title: form.title, venue: form.venue, opening_night: form.openingNight || null, color: form.color }).select().single();
      if (useTemplate) {
        for (let ci = 0; ci < LOAD_IN_TEMPLATE.length; ci++) {
          const cat = LOAD_IN_TEMPLATE[ci];
          const { data: catRow } = await supabase.from('categories').insert({ show_id: show.id, title: cat.title, sort_order: ci }).select().single();
          for (let ii = 0; ii < cat.items.length; ii++) {
            const item = cat.items[ii];
            const { data: subRow } = await supabase.from('subcategories').insert({ category_id: catRow.id, title: item.title, sort_order: ii }).select().single();
            for (let ti = 0; ti < item.tasks.length; ti++) {
              const task = item.tasks[ti];
              await supabase.from('tasks').insert({ subcategory_id: subRow.id, title: task.title, notes: task.notes || '', sort_order: ti });
            }
          }
        }
      }
      await loadAll();
      setActiveShowId(show.id);
      setView('show');
    });
  };

  const deleteShow = async (showId) => {
    await withSaving(async () => {
      await supabase.from('shows').delete().eq('id', showId);
      setView('shows');
      setActiveShowId(null);
      await loadAll();
    });
  };

  // ── Category CRUD ──────────────────────────────────────────────────────────
  const createCategory = async (showId, title) => {
    await withSaving(async () => {
      const { data: cat } = await supabase.from('categories').insert({ show_id: showId, title, sort_order: 999 }).select().single();
      setShows(prev => prev.map(s => s.id === showId ? { ...s, categories: [...s.categories, { ...cat, items: [] }] } : s));
    });
  };
  const deleteCategory = async (catId) => {
    await withSaving(async () => { await supabase.from('categories').delete().eq('id', catId); await loadAll(); });
  };

  // ── Subcategory CRUD ───────────────────────────────────────────────────────
  const createSubcategory = async (catId, title) => {
    await withSaving(async () => {
      const { data: sub } = await supabase.from('subcategories').insert({ category_id: catId, title, sort_order: 999 }).select().single();
      setShows(prev => prev.map(s => ({ ...s, categories: s.categories.map(c => c.id === catId ? { ...c, items: [...c.items, { ...sub, tasks: [] }] } : c) })));
    });
  };
  const deleteSubcategory = async (subId) => {
    await withSaving(async () => { await supabase.from('subcategories').delete().eq('id', subId); await loadAll(); });
  };

  // ── Task CRUD ──────────────────────────────────────────────────────────────
  const createTask = async (subId, form) => {
    await withSaving(async () => {
      const { data: task } = await supabase.from('tasks').insert({ subcategory_id: subId, title: form.title, notes: form.notes || '', deadline: form.deadline || null, priority: form.priority || 'medium', sort_order: 999 }).select().single();
      if (form.assignees?.length) {
        await supabase.from('task_assignees').insert(form.assignees.map(mid => ({ task_id: task.id, member_id: mid })));
      }
      const newTask = { ...task, assignees: form.assignees || [] };
      setShows(prev => prev.map(s => ({ ...s, categories: s.categories.map(c => ({ ...c, items: c.items.map(i => i.id === subId ? { ...i, tasks: [...i.tasks, newTask] } : i) })) })));
    });
  };
  const updateTask = async (taskId, form) => {
    await withSaving(async () => {
      await supabase.from('tasks').update({ title: form.title, notes: form.notes || '', deadline: form.deadline || null, priority: form.priority || 'medium' }).eq('id', taskId);
      await supabase.from('task_assignees').delete().eq('task_id', taskId);
      if (form.assignees?.length) {
        await supabase.from('task_assignees').insert(form.assignees.map(mid => ({ task_id: taskId, member_id: mid })));
      }
      await loadAll();
    });
  };
  const toggleSubcategory = async (subId, current) => {
    await supabase.from('subcategories').update({ done: !current }).eq('id', subId);
    setShows(prev => prev.map(s => ({ ...s, categories: s.categories.map(c => ({ ...c, items: c.items.map(i => i.id === subId ? { ...i, done: !current } : i) })) })));
  };
  const toggleAllSubTasks = async (subId, targetDone) => {
    const taskIds = shows.flatMap(s => s.categories.flatMap(c => c.items)).find(i => i.id === subId)?.tasks.map(t => t.id) || [];
    await Promise.all(taskIds.map(id => supabase.from('tasks').update({ done: targetDone }).eq('id', id)));
    setShows(prev => prev.map(s => ({ ...s, categories: s.categories.map(c => ({ ...c, items: c.items.map(i => i.id === subId ? { ...i, tasks: i.tasks.map(t => ({ ...t, done: targetDone })) } : i) })) })));
  };
  const toggleTask = async (taskId, current) => {
    await supabase.from('tasks').update({ done: !current }).eq('id', taskId);
    setShows(prev => prev.map(s => ({ ...s, categories: s.categories.map(c => ({ ...c, items: c.items.map(i => ({ ...i, tasks: i.tasks.map(t => t.id === taskId ? { ...t, done: !current } : t) })) })) })));
  };
  const deleteTask = async (taskId) => {
    await withSaving(async () => { await supabase.from('tasks').delete().eq('id', taskId); await loadAll(); });
  };

  // ── Member CRUD ────────────────────────────────────────────────────────────
  const createMember = async (form) => {
    await withSaving(async () => {
      const { data: member } = await supabase.from('members').insert({ name: form.name, role: form.role, color: form.color }).select().single();
      setMembers(prev => [...prev, member]);
    });
  };
  const deleteMember = async (memberId) => {
    await withSaving(async () => {
      await supabase.from('members').delete().eq('id', memberId);
      await loadAll();
    });
  };

  // ── All tasks flat list ────────────────────────────────────────────────────
  const allTasks = () => {
    const out = [];
    shows.forEach(s => s.categories.forEach(c => c.items.forEach(i => i.tasks.forEach(t => out.push({ ...t, showId: s.id, showTitle: s.title, showColor: s.color, catTitle: c.title, itemTitle: i.title })))));
    return out;
  };
  const filteredTodo = () => {
    let tasks = allTasks();
    if (filterMember !== 'all') tasks = tasks.filter(t => t.assignees.includes(filterMember));
    if (filterStatus === 'todo') tasks = tasks.filter(t => !t.done);
    if (filterStatus === 'done') tasks = tasks.filter(t => t.done);
    if (filterStatus === 'overdue') tasks = tasks.filter(t => !t.done && isOverdue(t.deadline));
    if (filterStatus === 'today') tasks = tasks.filter(t => !t.done && t.deadline === todayStr());
    tasks.sort((a, b) => { if (!a.deadline && !b.deadline) return 0; if (!a.deadline) return 1; if (!b.deadline) return -1; return a.deadline.localeCompare(b.deadline); });
    return tasks;
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center"><div className="text-5xl mb-4">🎭</div><div className="text-white text-xl">Loading...</div></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-gray-900 border-b border-gray-700 px-4 h-14 flex items-center gap-4">
        <div className="flex items-center gap-2 mr-4"><span className="text-2xl">🎭</span><span className="font-bold text-white text-lg hidden sm:block">Electrics PM</span></div>
        <button onClick={() => setView('shows')} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${view === 'shows' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}>Shows</button>
        <button onClick={() => setView('todo')} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${view === 'todo' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}>To-Do</button>
        <div className="flex-1" />
        {saving && <span className="text-xs text-gray-500 animate-pulse">Saving...</span>}
        <button onClick={() => setModal({ type: 'members' })} className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white">👥 Team</button>
      </nav>

      <div className="pt-14">
        {view === 'shows' && <ShowsView shows={shows} onNew={() => setModal({ type: 'addShow' })} onOpen={(id) => { setActiveShowId(id); setView('show'); }} onDelete={(id, title) => askConfirm(`Delete "${title}"? This cannot be undone.`, () => deleteShow(id))} />}
        {view === 'show' && activeShow && (
          <ShowDetailView show={activeShow} members={members} getMember={getMember}
            expandedCats={expandedCats} setExpandedCats={setExpandedCats}
            expandedItems={expandedItems} setExpandedItems={setExpandedItems}
            onBack={() => setView('shows')}
            onDelete={() => askConfirm(`Delete "${activeShow.title}"?`, () => deleteShow(activeShow.id))}
            onAddCategory={(title) => createCategory(activeShow.id, title)}
            onDeleteCategory={(catId, title) => askConfirm(`Delete category "${title}" and all tasks?`, () => deleteCategory(catId))}
            onAddSub={(catId, title) => createSubcategory(catId, title)}
            onDeleteSub={(subId, title) => askConfirm(`Delete subcategory "${title}" and all tasks?`, () => deleteSubcategory(subId))}
            onToggleSub={toggleSubcategory}
            onToggleAllSubTasks={toggleAllSubTasks}
            onAddTask={(subId) => setModal({ type: 'addTask', subId })}
            onEditTask={(task) => setModal({ type: 'editTask', task })}
            onToggleTask={toggleTask}
            onDeleteTask={(taskId, title) => askConfirm(`Delete task "${title}"?`, () => deleteTask(taskId))}
          />
        )}
        {view === 'todo' && (
          <TodoView tasks={filteredTodo()} members={members} getMember={getMember}
            filterMember={filterMember} setFilterMember={setFilterMember}
            filterStatus={filterStatus} setFilterStatus={setFilterStatus}
            onToggle={toggleTask} />
        )}
      </div>

      {/* Modals */}
      {modal?.type === 'addShow' && <AddShowModal onClose={() => setModal(null)} onSave={createShow} />}
      {modal?.type === 'members' && <MembersModal members={members} onClose={() => setModal(null)} onAdd={createMember} onDelete={(id) => askConfirm('Remove team member? They will be unassigned from all tasks.', () => deleteMember(id))} />}
      {modal?.type === 'addTask' && <TaskModal title="New Task" members={members} onClose={() => setModal(null)} onSave={(form) => createTask(modal.subId, form)} />}
      {modal?.type === 'editTask' && <TaskModal title="Edit Task" members={members} initial={modal.task} onClose={() => setModal(null)} onSave={(form) => updateTask(modal.task.id, form)} />}
      {confirm && <ConfirmModal message={confirm.message} onConfirm={confirm.onConfirm} onClose={() => setConfirm(null)} />}
    </div>
  );
}

// ─── Shows View ───────────────────────────────────────────────────────────────
function ShowsView({ shows, onNew, onOpen, onDelete }) {
  return (
    <div className="p-4 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Active Shows</h1>
        <button onClick={onNew} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium">+ New Show</button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {shows.map(s => {
          const allT = s.categories.flatMap(c => c.items.flatMap(i => i.tasks));
          const pct = calcProgress(allT);
          const overdueCount = allT.filter(t => !t.done && isOverdue(t.deadline)).length;
          return (
            <div key={s.id} className="bg-gray-800 rounded-xl p-5 border border-gray-700 hover:border-indigo-500 transition-colors group relative">
              <button onClick={e => { e.stopPropagation(); onDelete(s.id, s.title); }} className="absolute top-3 right-3 w-7 h-7 rounded-lg flex items-center justify-center text-gray-600 hover:text-red-400 hover:bg-gray-700 opacity-0 group-hover:opacity-100">🗑</button>
              <div className="cursor-pointer" onClick={() => onOpen(s.id)}>
                <div className="flex items-start justify-between mb-3 pr-6">
                  <div><div className="flex items-center gap-2 mb-1"><div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} /><h2 className="font-bold text-white text-lg group-hover:text-indigo-300">{s.title}</h2></div><div className="text-gray-400 text-sm">{s.venue}</div></div>
                  {s.opening_night && <div className="text-right flex-shrink-0"><div className="text-xs text-gray-500">Opening</div><div className="text-sm text-gray-300">{fmt(s.opening_night)}</div></div>}
                </div>
                <ProgressBar pct={pct} />
                <div className="flex justify-between mt-3 text-xs text-gray-400">
                  <span>{allT.filter(t => t.done).length}/{allT.length} tasks complete</span>
                  {overdueCount > 0 && <span className="text-red-400">⚠ {overdueCount} overdue</span>}
                </div>
              </div>
            </div>
          );
        })}
        {shows.length === 0 && (
          <div className="col-span-2 text-center py-20 text-gray-500">
            <div className="text-5xl mb-4">🎭</div>
            <p className="text-lg mb-1">No shows yet.</p>
            <p className="text-sm">Hit <span className="text-indigo-400 font-medium">+ New Show</span> and choose the Load-In Template.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Show Detail View ─────────────────────────────────────────────────────────
function ShowDetailView({ show, members, getMember, expandedCats, setExpandedCats, expandedItems, setExpandedItems, onBack, onDelete, onAddCategory, onDeleteCategory, onAddSub, onDeleteSub, onToggleSub, onToggleAllSubTasks, onAddTask, onEditTask, onToggleTask, onDeleteTask }) {
  const [newCatName, setNewCatName] = useState('');
  const allT = show.categories.flatMap(c => c.items.flatMap(i => i.tasks));
  const pct = calcProgress(allT);

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <button onClick={onBack} className="text-gray-400 hover:text-white text-sm mb-4">← All Shows</button>
      <div className="flex items-start justify-between mb-2 flex-wrap gap-2">
        <div><div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full" style={{ backgroundColor: show.color }} /><h1 className="text-2xl font-bold text-white">{show.title}</h1></div>
          {show.venue && <p className="text-gray-400 text-sm mt-0.5">{show.venue}{show.opening_night && ` · Opens ${fmt(show.opening_night)}`}</p>}</div>
        <div className="flex gap-2">
          <button onClick={onDelete} className="bg-gray-700 hover:bg-red-700 text-gray-300 hover:text-white px-3 py-1.5 rounded-lg text-sm transition-colors">🗑 Delete</button>
        </div>
      </div>
      <div className="mb-6 mt-3"><ProgressBar pct={pct} size="lg" /><div className="text-xs text-gray-500 mt-1">{allT.filter(t => t.done).length} / {allT.length} tasks</div></div>

      <div className="space-y-3">
        {show.categories.map(cat => {
          const catTasks = cat.items.flatMap(i => i.tasks);
          const catPct = calcProgress(catTasks);
          const open = expandedCats[cat.id] !== false;
          return (
            <div key={cat.id} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
              <div className="flex items-center gap-3 p-4">
                <button className="text-gray-400 text-sm w-4" onClick={() => setExpandedCats(p => ({ ...p, [cat.id]: !open }))}>{open ? '▾' : '▸'}</button>
                <span className="font-bold text-white flex-1 cursor-pointer" onClick={() => setExpandedCats(p => ({ ...p, [cat.id]: !open }))}>{cat.title}</span>
                <div className="w-32 hidden sm:block"><ProgressBar pct={catPct} size="sm" /></div>
                <button onClick={() => onDeleteCategory(cat.id, cat.title)} className="text-gray-600 hover:text-red-400 px-1 py-1 rounded hover:bg-gray-700">🗑</button>
              </div>
              {open && (
                <div className="border-t border-gray-700 divide-y divide-gray-700">
                  {cat.items.map(item => {
                    const itemPct = calcProgress(item.tasks);
                    const itemOpen = expandedItems[item.id] !== false;
                    return (
                      <div key={item.id}>
                        <div className="flex items-center gap-3 px-6 py-3 bg-gray-800">
                          {item.tasks.length === 0
                            ? <button onClick={() => onToggleSub(item.id, item.done)} className={`w-5 h-5 rounded flex-shrink-0 border-2 flex items-center justify-center transition-colors ${item.done ? 'bg-green-600 border-green-600' : 'border-gray-500 hover:border-indigo-400'}`}>{item.done && <span className="text-white text-xs">✓</span>}</button>
                            : <button onClick={() => onToggleAllSubTasks(item.id, !item.tasks.every(t => t.done))} className={`w-5 h-5 rounded flex-shrink-0 border-2 flex items-center justify-center transition-colors ${item.tasks.every(t => t.done) ? 'bg-green-600 border-green-600' : item.tasks.some(t => t.done) ? 'border-indigo-400 bg-indigo-900/40' : 'border-gray-500 hover:border-indigo-400'}`}>{item.tasks.every(t => t.done) ? <span className="text-white text-xs">✓</span> : item.tasks.some(t => t.done) ? <span className="text-indigo-400 text-xs">–</span> : null}</button>
                          }
                          <button className="text-gray-500 text-xs w-3" onClick={() => setExpandedItems(p => ({ ...p, [item.id]: !itemOpen }))}>{itemOpen ? '▾' : '▸'}</button>
                          <span className={`font-medium flex-1 cursor-pointer ${item.tasks.length === 0 && item.done ? 'line-through text-gray-500' : 'text-gray-200'}`} onClick={() => setExpandedItems(p => ({ ...p, [item.id]: !itemOpen }))}>{item.title}</span>
                          {item.tasks.length > 0 && <><div className="w-24 hidden sm:block"><ProgressBar pct={itemPct} size="sm" /></div><Badge color={itemPct === 100 ? 'green' : 'gray'}>{item.tasks.filter(t => t.done).length}/{item.tasks.length}</Badge></>}
                          <button onClick={() => onAddTask(item.id)} className="text-gray-500 hover:text-indigo-400 text-sm px-2 py-1 rounded hover:bg-gray-700">+ Task</button>
                          <button onClick={() => onDeleteSub(item.id, item.title)} className="text-gray-600 hover:text-red-400 px-1 py-1 rounded hover:bg-gray-700">🗑</button>
                        </div>
                        {itemOpen && (
                          <div className="px-6 pb-2 pt-1 space-y-1" style={{ backgroundColor: '#1a1f2e' }}>
                            {item.tasks.map(task => (
                              <div key={task.id} className={`flex items-center gap-3 py-2 px-3 rounded-lg group ${task.done ? 'opacity-60' : ''}`} style={{ backgroundColor: task.done ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                                <button onClick={() => onToggleTask(task.id, task.done)} className={`w-5 h-5 rounded flex-shrink-0 border-2 flex items-center justify-center transition-colors ${task.done ? 'bg-green-600 border-green-600' : 'border-gray-600 hover:border-indigo-400'}`}>{task.done && <span className="text-white text-xs">✓</span>}</button>
                                <span className={`flex-1 text-sm ${task.done ? 'line-through text-gray-500' : 'text-gray-200'}`}>{task.title}</span>
                                <PriorityBadge priority={task.priority} />
                                {task.notes && <span className="text-gray-600 hidden sm:block" title={task.notes}>📝</span>}
                                <DeadlineBadge deadline={task.deadline} done={task.done} />
                                <div className="flex -space-x-1">{task.assignees.map(aid => { const m = getMember(aid); return m ? <Avatar key={aid} member={m} /> : null; })}</div>
                                <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
                                  <button onClick={() => onEditTask(task)} className="text-gray-500 hover:text-indigo-400 px-1 py-1 rounded hover:bg-gray-700 text-xs">✏</button>
                                  <button onClick={() => onDeleteTask(task.id, task.title)} className="text-gray-500 hover:text-red-400 px-1 py-1 rounded hover:bg-gray-700 text-xs">🗑</button>
                                </div>
                              </div>
                            ))}
                            {item.tasks.length === 0 && <p className="text-gray-600 text-xs py-2">No tasks yet.</p>}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {/* Add subcategory inline */}
                  <AddSubcategoryInline catId={cat.id} onAdd={onAddSub} />
                </div>
              )}
            </div>
          );
        })}
      </div>
      {/* Add category */}
      <div className="mt-4 flex gap-2">
        <input value={newCatName} onChange={e => setNewCatName(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && newCatName.trim()) { onAddCategory(newCatName.trim()); setNewCatName(''); } }}
          placeholder="New category name (e.g. Pyrotechnics)…"
          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" />
        <button onClick={() => { if (newCatName.trim()) { onAddCategory(newCatName.trim()); setNewCatName(''); } }}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium">+ Category</button>
      </div>
    </div>
  );
}

function AddSubcategoryInline({ catId, onAdd }) {
  const [val, setVal] = useState('');
  return (
    <div className="px-6 py-2 flex gap-2">
      <input value={val} onChange={e => setVal(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' && val.trim()) { onAdd(catId, val.trim()); setVal(''); } }}
        placeholder="Add subcategory…"
        className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-indigo-500" />
      <button onClick={() => { if (val.trim()) { onAdd(catId, val.trim()); setVal(''); } }} className="text-gray-500 hover:text-indigo-400 text-xs px-2">+ Sub</button>
    </div>
  );
}

// ─── Todo View ────────────────────────────────────────────────────────────────
function TodoView({ tasks, members, getMember, filterMember, setFilterMember, filterStatus, setFilterStatus, onToggle }) {
  const grouped = {};
  tasks.forEach(t => { if (!grouped[t.showId]) grouped[t.showId] = { title: t.showTitle, color: t.showColor, tasks: [] }; grouped[t.showId].tasks.push(t); });
  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-4">To-Do List</h1>
      <div className="flex flex-wrap gap-2 mb-6">
        <select value={filterMember} onChange={e => setFilterMember(e.target.value)} className="bg-gray-700 text-gray-200 rounded-lg px-3 py-1.5 text-sm border border-gray-600 focus:outline-none focus:border-indigo-500">
          <option value="all">All crew</option>
          {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
        {['all','todo','done','overdue','today'].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)} className={`px-3 py-1.5 rounded-lg text-sm ${filterStatus === s ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-400 hover:text-white'}`}>
            {s === 'all' ? 'All' : s === 'todo' ? 'To Do' : s === 'done' ? 'Done' : s === 'overdue' ? '⚠ Overdue' : 'Due Today'}
          </button>
        ))}
      </div>
      {Object.values(grouped).length === 0
        ? <div className="text-center py-16 text-gray-500"><div className="text-4xl mb-3">✓</div><p>No tasks match.</p></div>
        : Object.values(grouped).map(g => (
          <div key={g.title} className="mb-6">
            <div className="flex items-center gap-2 mb-2"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: g.color }} /><h2 className="text-white font-semibold">{g.title}</h2></div>
            <div className="bg-gray-800 rounded-xl border border-gray-700 divide-y divide-gray-700 overflow-hidden">
              {g.tasks.map(task => (
                <div key={task.id} className={`flex items-center gap-3 px-4 py-3 ${task.done ? 'opacity-60' : ''}`}>
                  <button onClick={() => onToggle(task.id, task.done)} className={`w-5 h-5 rounded flex-shrink-0 border-2 flex items-center justify-center ${task.done ? 'bg-green-600 border-green-600' : 'border-gray-600 hover:border-indigo-400'}`}>{task.done && <span className="text-white text-xs">✓</span>}</button>
                  <div className="flex-1 min-w-0"><div className={`text-sm ${task.done ? 'line-through text-gray-500' : 'text-gray-200'}`}>{task.title}</div><div className="text-xs text-gray-500">{task.catTitle} › {task.itemTitle}</div></div>
                  <PriorityBadge priority={task.priority} />
                  <DeadlineBadge deadline={task.deadline} done={task.done} />
                  <div className="flex -space-x-1">{task.assignees.map(aid => { const m = getMember(aid); return m ? <Avatar key={aid} member={m} /> : null; })}</div>
                </div>
              ))}
            </div>
          </div>
        ))
      }
    </div>
  );
}

// ─── Add Show Modal ───────────────────────────────────────────────────────────
const TEMPLATE_SUMMARY = `${LOAD_IN_TEMPLATE.length} categories · ${LOAD_IN_TEMPLATE.reduce((a,c)=>a+c.items.length,0)} subcategories · ${LOAD_IN_TEMPLATE.reduce((a,c)=>a+c.items.reduce((b,i)=>b+i.tasks.length,0),0)} tasks`;

function AddShowModal({ onClose, onSave }) {
  const [form, setForm] = useState({ title: '', venue: '', openingNight: '', color: SHOW_COLORS[0] });
  const [useTemplate, setUseTemplate] = useState(true);
  const [saving, setSaving] = useState(false);
  const handleSave = async () => {
    if (!form.title.trim() || saving) return;
    setSaving(true);
    await onSave(form, useTemplate);
    setSaving(false);
    onClose();
  };
  return (
    <Modal title="New Show" onClose={onClose}>
      <div className="space-y-3">
        <div className={`rounded-xl border-2 p-3 cursor-pointer ${useTemplate ? 'border-indigo-500 bg-indigo-900/20' : 'border-gray-600 hover:border-gray-500'}`} onClick={() => setUseTemplate(true)}>
          <div className="flex items-start gap-3">
            <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center ${useTemplate ? 'border-indigo-400 bg-indigo-500' : 'border-gray-500'}`}>{useTemplate && <div className="w-2 h-2 rounded-full bg-white" />}</div>
            <div><div className="flex items-center gap-2 flex-wrap"><span className="text-white font-semibold text-sm">🎭 Load-In Template</span><span className="bg-indigo-700 text-indigo-200 text-xs px-2 py-0.5 rounded">Recommended</span></div>
              <p className="text-gray-400 text-xs mt-1">Full production checklist — {TEMPLATE_SUMMARY}. Delete what you don&apos;t need.</p></div>
          </div>
        </div>
        <div className={`rounded-xl border-2 p-3 cursor-pointer ${!useTemplate ? 'border-indigo-500 bg-indigo-900/20' : 'border-gray-600 hover:border-gray-500'}`} onClick={() => setUseTemplate(false)}>
          <div className="flex items-center gap-3">
            <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${!useTemplate ? 'border-indigo-400 bg-indigo-500' : 'border-gray-500'}`}>{!useTemplate && <div className="w-2 h-2 rounded-full bg-white" />}</div>
            <div><span className="text-white font-semibold text-sm">📋 Blank Show</span><p className="text-gray-400 text-xs mt-0.5">Start from scratch.</p></div>
          </div>
        </div>
        <div className="border-t border-gray-700 pt-3 space-y-3">
          <div><label className="text-xs text-gray-400 block mb-1">Show title *</label>
            <input autoFocus value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} onKeyDown={e => e.key === 'Enter' && handleSave()} placeholder="e.g. Les Misérables"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-gray-400 block mb-1">Venue / Stage</label>
              <input value={form.venue} onChange={e => setForm(f => ({ ...f, venue: e.target.value }))} placeholder="e.g. Main Stage" className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" /></div>
            <div><label className="text-xs text-gray-400 block mb-1">Opening Night</label>
              <input type="date" value={form.openingNight} onChange={e => setForm(f => ({ ...f, openingNight: e.target.value }))} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" /></div>
          </div>
          <div><label className="text-xs text-gray-400 block mb-2">Colour</label>
            <div className="flex gap-2 flex-wrap">{SHOW_COLORS.map(c => <button key={c} onClick={() => setForm(f => ({ ...f, color: c }))} className={`w-7 h-7 rounded-full transition-transform ${form.color === c ? 'scale-125 ring-2 ring-white ring-offset-1 ring-offset-gray-800' : 'hover:scale-110'}`} style={{ backgroundColor: c }} />)}</div>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-gray-400 hover:text-white text-sm">Cancel</button>
          <button onClick={handleSave} disabled={!form.title.trim() || saving} className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-sm font-medium">
            {saving ? 'Creating…' : useTemplate ? 'Create from Template →' : 'Create Blank →'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Members Modal ────────────────────────────────────────────────────────────
function MembersModal({ members, onClose, onAdd, onDelete }) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [color, setColor] = useState(MEMBER_COLORS[0]);
  const [saving, setSaving] = useState(false);
  const handleAdd = async () => {
    if (!name.trim() || saving) return;
    setSaving(true);
    await onAdd({ name: name.trim(), role: role.trim(), color });
    setName(''); setRole(''); setSaving(false);
  };
  return (
    <Modal title="Team Members" onClose={onClose}>
      <div className="space-y-2 mb-5 max-h-56 overflow-y-auto">
        {members.length === 0 && <p className="text-gray-500 text-sm text-center py-4">No team members yet.</p>}
        {members.map(m => (
          <div key={m.id} className="flex items-center gap-3 bg-gray-700 rounded-lg px-3 py-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-sm flex-shrink-0" style={{ backgroundColor: m.color }}>{m.name.split(' ').map(n => n[0]).join('')}</div>
            <div className="flex-1"><div className="text-white text-sm font-medium">{m.name}</div><div className="text-gray-400 text-xs">{m.role || 'No role set'}</div></div>
            <button onClick={() => onDelete(m.id)} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-red-400 hover:bg-gray-600 text-lg font-bold">×</button>
          </div>
        ))}
      </div>
      <div className="border-t border-gray-700 pt-4">
        <p className="text-sm font-medium text-gray-300 mb-3">Add crew member</p>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Full name" className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" />
          <input value={role} onChange={e => setRole(e.target.value)} placeholder="Role (e.g. Chief LX)" className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" />
        </div>
        <div className="flex gap-2 mb-3 flex-wrap">{MEMBER_COLORS.map(c => <button key={c} onClick={() => setColor(c)} className={`w-7 h-7 rounded-full transition-transform ${color === c ? 'scale-125 ring-2 ring-white ring-offset-1 ring-offset-gray-800' : 'hover:scale-110'}`} style={{ backgroundColor: c }} />)}</div>
        <button onClick={handleAdd} disabled={!name.trim() || saving} className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-lg py-2 text-sm font-medium">
          {saving ? 'Adding…' : 'Add Member'}
        </button>
      </div>
    </Modal>
  );
}

// ─── Task Modal ───────────────────────────────────────────────────────────────
function TaskModal({ title, members, initial = {}, onClose, onSave }) {
  const [form, setForm] = useState({ title: initial.title || '', deadline: initial.deadline || '', notes: initial.notes || '', assignees: initial.assignees || [], priority: initial.priority || 'medium' });
  const [saving, setSaving] = useState(false);
  const toggle = (id) => setForm(f => ({ ...f, assignees: f.assignees.includes(id) ? f.assignees.filter(a => a !== id) : [...f.assignees, id] }));
  const handleSave = async () => {
    if (!form.title.trim() || saving) return;
    setSaving(true);
    await onSave(form);
    setSaving(false);
    onClose();
  };
  return (
    <Modal title={title} onClose={onClose}>
      <div className="space-y-3">
        <div><label className="text-xs text-gray-400 block mb-1">Task title *</label>
          <input autoFocus value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Rig FOH bars"
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" /></div>
        <div><label className="text-xs text-gray-400 block mb-1">Deadline</label>
          <input type="date" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" /></div>
        <div><label className="text-xs text-gray-400 block mb-1">Notes</label>
          <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} placeholder="Any notes…"
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 resize-none" /></div>
        <div><label className="text-xs text-gray-400 block mb-1">Priority</label>
          <div className="flex gap-2">
            {['low', 'medium', 'high'].map(p => (
              <button key={p} onClick={() => setForm(f => ({ ...f, priority: p }))}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors ${form.priority === p
                  ? p === 'high' ? 'bg-red-900/60 border-red-500 text-red-300'
                    : p === 'low' ? 'bg-gray-700 border-gray-400 text-gray-200'
                    : 'bg-indigo-900/60 border-indigo-500 text-indigo-300'
                  : 'border-gray-600 text-gray-500 hover:border-gray-500'}`}>
                {p === 'high' ? '↑ High' : p === 'medium' ? 'Medium' : '↓ Low'}
              </button>
            ))}
          </div>
        </div>
        <div><label className="text-xs text-gray-400 block mb-2">Assign crew</label>
          <div className="flex flex-wrap gap-2">
            {members.map(m => (<button key={m.id} onClick={() => toggle(m.id)} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm border ${form.assignees.includes(m.id) ? 'border-indigo-500 bg-indigo-900 text-white' : 'border-gray-600 text-gray-400 hover:border-gray-500'}`}>
              <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: m.color }}>{m.name[0]}</div>{m.name.split(' ')[0]}</button>))}
            {members.length === 0 && <p className="text-gray-500 text-xs">Add team members via the 👥 Team button first.</p>}
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-gray-400 hover:text-white text-sm">Cancel</button>
          <button onClick={handleSave} disabled={!form.title.trim() || saving} className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-sm font-medium">
            {saving ? 'Saving…' : 'Save Task'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
