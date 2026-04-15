import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  accountAPI,
  analyticsAPI,
  announcementsAPI,
  communicationAPI,
  instructorAPI,
  roleSettingsAPI,
} from '@/shared/api/client';
import { formatDate, unwrapData, useAsyncResource } from '@/shared/api/live';
import { useAuthStore } from '@/shared/state/auth';
import { ActionButton, Card, CircleAvatar, LinkButton, PageHeading, ProgressBar, StatCard, StatusPill, TabButton } from '@/shared/ui/talentFlow';
import { AnnouncementForm } from './AnnouncementForm';

const ErrorCard = ({ error }: { error: string | null }) => (error ? <Card className="border-red-200 bg-red-50 text-sm text-red-700">{error}</Card> : null);
const EmptyCard = ({ text }: { text: string }) => <Card className="text-sm text-[#7a80a9]">{text}</Card>;

function courseGlyph(category?: string) {
  const lower = String(category || '').toLowerCase();
  if (lower.includes('ui') || lower.includes('design')) return '🎨';
  if (lower.includes('front')) return '💻';
  if (lower.includes('social')) return '📱';
  if (lower.includes('back')) return '⚙️';
  if (lower.includes('product')) return '📈';
  return '📚';
}

function courseStatusTone(status?: string) {
  const lower = String(status || '').toLowerCase();
  if (lower === 'draft') return 'warning' as const;
  if (lower === 'archived') return 'neutral' as const;
  return 'primary' as const;
}

export function InstructorDashboardPage() {
  const { data: courses } = useAsyncResource(() => instructorAPI.getCourses(), []);
  const { data: submissions } = useAsyncResource(() => instructorAPI.getSubmissions(), []);
  const pending = (submissions || []).filter((item: any) => String(item.status).toLowerCase() !== 'graded');
  const learners = Array.from(new Set((submissions || []).map((item: any) => item.learner?.id || item.userId).filter(Boolean))).length;
  const average = Math.round((submissions || []).reduce((sum: number, item: any) => sum + (item.score || 0), 0) / Math.max((submissions || []).filter((item: any) => item.score != null).length, 1));

  return (
    <div className="space-y-7">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Learners" value={String(learners)} tone="rose" />
        <StatCard title="Active Courses" value={String(courses?.length || 0)} tone="blue" />
        <StatCard title="Pending Submissions" value={String(pending.length)} tone="default" />
        <StatCard title="Average Score" value={`${average || 0}%`} tone="amber" />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-3">
          <h3 className="text-[18px] font-semibold text-[#1f2560]">My Courses</h3>
          {(courses || []).slice(0, 5).map((course: any) => (
            <div className="flex items-center justify-between rounded-md border border-[#e4e6f2] bg-[#fcfcff] px-2.5 py-2" key={course.id}>
              <div>
                <p className="text-[11px] font-semibold text-[#2a315f]">{course.title}</p>
                <p className="text-[10px] text-[#7a80a8]">{course.lessonCount || 0} lessons • {course.assignmentCount || 0} assignments</p>
              </div>
              <StatusPill label={course.status} tone={course.status === 'draft' ? 'warning' : 'neutral'} />
            </div>
          ))}
        </Card>
        <Card className="space-y-3">
          <h3 className="text-[18px] font-semibold text-[#1f2560]">Pending Submissions</h3>
          {pending.slice(0, 5).map((item: any) => (
            <div className="flex items-center justify-between rounded-md border border-[#e4e6f2] bg-[#fcfcff] px-2.5 py-2" key={item.id}>
              <p className="text-[11px] font-semibold text-[#2a315f]">{item.assignment?.title || item.assignmentTitle || 'Assignment'}</p>
              <LinkButton to="/instructor/submissions" variant="primary">Review</LinkButton>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

export function InstructorCoursesPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'draft' | 'archived'>('all');
  const { data, loading, error } = useAsyncResource(async () => {
    const courses = unwrapData<any[]>(await instructorAPI.getCourses()) || [];
    const learnersByCourse = await Promise.all(
      courses.map(async (course: any) => {
        try {
          const learners = unwrapData<any[]>(await instructorAPI.getCourseLearners(course.id)) || [];
          return [String(course.id), learners.length];
        } catch {
          return [String(course.id), 0];
        }
      }),
    );

    return courses.map((course: any) => ({
      ...course,
      learnerCount: Number(Object.fromEntries(learnersByCourse)[String(course.id)] || 0),
    }));
  }, []);
  const filtered = (data || []).filter((course: any) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return String(course.status) === 'published';
    return String(course.status) === activeTab;
  });

  return (
    <div className="space-y-7">
      <PageHeading
        title="My courses"
        subtitle="Create, monitor, and update the courses you own."
        action={<LinkButton to="/instructor/courses/create" variant="primary">Create courses</LinkButton>}
      />
      <ErrorCard error={error} />
      <div className="flex flex-wrap gap-6 border-b border-[#e0e4ec] pb-3">
        {[
          { key: 'all', label: `All (${(data || []).length})` },
          { key: 'active', label: `Active (${(data || []).filter((course: any) => String(course.status) === 'published').length})` },
          { key: 'draft', label: `Draft (${(data || []).filter((course: any) => String(course.status) === 'draft').length})` },
          { key: 'archived', label: `Archived (${(data || []).filter((course: any) => String(course.status) === 'archived').length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            className={`border-b-2 pb-2 text-[13px] font-medium transition-colors ${
              activeTab === tab.key ? 'border-[#1d245d] text-[#1d245d]' : 'border-transparent text-[#6f769c] hover:text-[#1d245d]'
            }`}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>
      {loading ? (
        <EmptyCard text="Loading courses..." />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((course: any) => {
            const category = course.category || 'General';
            const learnerCount = Number(course.learnerCount || 0);
            const actionLabel = String(course.status) === 'draft' ? 'Continue setup' : 'View submissions';
            const actionTo = String(course.status) === 'draft' ? `/instructor/courses/${course.id}` : '/instructor/submissions';
            const instructorName = [course.instructorFirstName, course.instructorLastName].filter(Boolean).join(' ') || 'You';

            return (
              <Card className="overflow-hidden p-0" key={course.id}>
                <div className="relative flex h-40 items-center justify-center bg-gradient-to-br from-[#eef2fb] via-[#f9fafc] to-[#e6edf8] text-6xl">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(8,16,123,0.08),_transparent_45%),radial-gradient(circle_at_bottom_left,_rgba(240,138,44,0.16),_transparent_40%)]" />
                  <div className="relative rounded-2xl border border-white/80 bg-white px-5 py-4 shadow-sm">
                    {courseGlyph(category)}
                  </div>
                </div>
                <div className="space-y-4 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <span className="rounded-lg border border-[#d7dbef] bg-white px-3 py-1 text-[10px] font-semibold text-[#2f356f]">
                      {category}
                    </span>
                    <StatusPill label={String(course.status)} tone={courseStatusTone(course.status)} />
                  </div>
                  <div>
                    <p className="text-[16px] font-bold text-[#1d245d]">{course.title}</p>
                    <p className="mt-1 text-[12px] text-[#5f6796]">
                      Instructor: {instructorName}
                    </p>
                    <p className="mt-2 line-clamp-2 text-[11px] leading-relaxed text-[#6f769c]">
                      {course.description || 'This course is ready for modules, lessons, and assignments.'}
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-2 rounded-xl bg-[#f7f8fc] p-3">
                    <div>
                      <p className="text-[9px] uppercase tracking-wide text-[#8d93b1]">Lessons</p>
                      <p className="mt-1 text-[15px] font-bold text-[#1d245d]">{course.lessonCount || 0}</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-wide text-[#8d93b1]">Learners</p>
                      <p className="mt-1 text-[15px] font-bold text-[#1d245d]">{learnerCount}</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-wide text-[#8d93b1]">Tasks</p>
                      <p className="mt-1 text-[15px] font-bold text-[#1d245d]">{course.assignmentCount || 0}</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <LinkButton to={`/instructor/courses/${course.id}`} variant="secondary">Open</LinkButton>
                    <LinkButton to={actionTo} variant="primary">{actionLabel}</LinkButton>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function InstructorCreateCoursePage() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    status: 'draft',
    category: 'Backend Engineering',
    level: 'beginner',
    duration: '6',
    catalogVisibility: 'public',
  });
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  return (
    <div className="space-y-6">
      <PageHeading title="Create course" subtitle="Set up the core details for a new course before adding content." />
      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <Card className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1 block text-[11px] font-semibold text-[#1d245d]">Course title</label>
              <input className="h-11 w-full rounded-lg border border-[#d8dcee] px-3 text-[12px]" placeholder="Backend Engineering Fundamentals" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-[11px] font-semibold text-[#1d245d]">Description</label>
              <textarea className="min-h-[160px] w-full rounded-lg border border-[#d8dcee] px-3 py-3 text-[12px]" placeholder="Describe the course outcomes, modules, and learner expectations." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-[#1d245d]">Category</label>
              <input className="h-11 w-full rounded-lg border border-[#d8dcee] px-3 text-[12px]" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-[#1d245d]">Level</label>
              <select className="h-11 w-full rounded-lg border border-[#d8dcee] px-3 text-[12px]" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-[#1d245d]">Status</label>
              <select className="h-11 w-full rounded-lg border border-[#d8dcee] px-3 text-[12px]" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-[#1d245d]">Duration (hours)</label>
              <input className="h-11 w-full rounded-lg border border-[#d8dcee] px-3 text-[12px]" type="number" min="1" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-3">
            <ActionButton loading={saving} variant="primary" onClick={async () => {
              setSaving(true);
              try {
                await instructorAPI.createCourse({ ...form, duration: Number(form.duration), assignments: [] });
                navigate('/instructor/courses');
              } finally { setSaving(false); }
            }}>Save course</ActionButton>
            <LinkButton to="/instructor/courses" variant="secondary">Cancel</LinkButton>
          </div>
        </Card>

        <Card className="overflow-hidden p-0">
          <div className="flex h-44 items-center justify-center bg-gradient-to-br from-[#eef2fb] via-[#f8faff] to-[#fff2e8] text-6xl">
            {courseGlyph(form.category)}
          </div>
          <div className="space-y-4 p-5">
            <div className="flex items-center justify-between">
              <span className="rounded-full border border-[#d7dbef] px-3 py-1 text-[10px] font-semibold text-[#2f356f]">{form.category}</span>
              <StatusPill label={form.status} tone={courseStatusTone(form.status)} />
            </div>
            <div>
              <h3 className="text-[20px] font-bold text-[#001d4c]">{form.title || 'Your course title'}</h3>
              <p className="mt-2 text-[12px] leading-relaxed text-[#6f769c]">{form.description || 'A live preview of how the course header will look once it is created.'}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 rounded-xl bg-[#f7f8fc] p-3">
              <div>
                <p className="text-[9px] uppercase tracking-wide text-[#8d93b1]">Level</p>
                <p className="mt-1 text-[13px] font-bold text-[#1d245d] capitalize">{form.level}</p>
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-wide text-[#8d93b1]">Duration</p>
                <p className="mt-1 text-[13px] font-bold text-[#1d245d]">{form.duration || '0'} hrs</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export function InstructorSubmissionsPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'graded'>('all');
  const { data, loading, error } = useAsyncResource(() => instructorAPI.getSubmissions(), []);
  const rows = (data || []).filter((entry: any) => activeTab === 'all' ? true : String(entry.status).toLowerCase() === activeTab);
  return (
    <div className="space-y-5">
      <PageHeading title="Submissions" />
      <ErrorCard error={error} />
      <div className="flex gap-2">{['all', 'pending', 'graded'].map((tab) => <TabButton key={tab} active={activeTab === tab} onClick={() => setActiveTab(tab as any)}>{tab}</TabButton>)}</div>
      {loading ? <EmptyCard text="Loading submissions..." /> : (
        <Card className="space-y-3">
          {rows.map((row: any) => (
            <div className="flex items-center justify-between border-b border-[#eceff8] pb-3 last:border-b-0" key={row.id}>
              <div><p className="text-[11px] font-semibold text-[#2f356f]">{row.assignment?.title || row.assignmentTitle || 'Assignment'}</p><p className="text-[10px] text-[#8e93b2]">{row.learner?.name || row.email || 'Learner'} • {formatDate(row.submittedAt || row.updatedAt)}</p></div>
              <LinkButton to="/instructor/grades" variant="primary">Grade</LinkButton>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

export function InstructorGradesPage() {
  const { data, loading } = useAsyncResource(() => instructorAPI.getSubmissions(), []);
  const submission = data?.[0];
  const [score, setScore] = useState(85);
  const [feedback, setFeedback] = useState('');
  const [saving, setSaving] = useState(false);
  return (
    <div className="max-w-[640px] space-y-4">
      <PageHeading title="Grade Assignment" />
      {loading || !submission ? <EmptyCard text="Loading submission..." /> : (
        <>
          <Card><p className="text-[12px] font-semibold text-[#2a315f]">{submission.learner?.name || 'Learner'}</p><p className="text-[10px] text-[#7a80a8]">{submission.assignment?.title || 'Assignment'}</p></Card>
          <Card className="space-y-3">
            <input className="h-10 rounded-md border border-[#d7dcef] px-3 text-[11px]" type="number" value={score} onChange={(e) => setScore(Number(e.target.value))} />
            <textarea className="min-h-[90px] rounded-md border border-[#d7dcef] px-3 py-2 text-[11px]" value={feedback} onChange={(e) => setFeedback(e.target.value)} />
            <ActionButton loading={saving} variant="primary" onClick={async () => {
              setSaving(true);
              try {
                await instructorAPI.gradeSubmission(submission.id, { score, feedback, status: 'graded' });
              } finally { setSaving(false); }
            }}>Submit Grade</ActionButton>
          </Card>
        </>
      )}
    </div>
  );
}

export function InstructorLearnersPage() {
  const { data, loading, error } = useAsyncResource(() => instructorAPI.getLearners(), []);
  return <div className="space-y-4"><PageHeading title="Learners" /><ErrorCard error={error} />{loading ? <EmptyCard text="Loading learners..." /> : <Card className="space-y-2">{(data || []).map((row: any) => <div className="flex items-center gap-3 rounded-md border border-[#eceff8] px-2.5 py-2" key={row.learner?.id}><CircleAvatar initials={(row.learner?.name || 'L').slice(0,2).toUpperCase()} /><div className="flex-1"><p className="text-[11px] font-semibold text-[#2f356f]">{row.learner?.name}</p><p className="text-[10px] text-[#8e93b2]">{row.learner?.email}</p></div><StatusPill label={`${row.courses?.length || 0} courses`} tone="neutral" /></div>)}</Card>}</div>;
}

export function InstructorDiscussionPage() {
  const { data: channels } = useAsyncResource(() => communicationAPI.listChannels(), []);
  const [active, setActive] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [content, setContent] = useState('');
  useEffect(() => { if (!active && channels?.[0]?.id) setActive(String(channels[0].id)); }, [channels, active]);
  useEffect(() => { if (!active) return; communicationAPI.listMessages(active).then((res: any) => setMessages(unwrapData<any[]>(res))); }, [active]);
  return <div className="grid gap-4 xl:grid-cols-[280px_1fr]"><Card className="space-y-2">{(channels || []).map((channel: any) => <button key={channel.id} type="button" className="w-full rounded-md border px-3 py-2 text-left" onClick={() => setActive(String(channel.id))}>{channel.name}</button>)}</Card><Card className="space-y-3">{messages.map((m: any) => <div key={m.id} className="rounded-md bg-[#f8f9fc] p-3 text-[11px]">{m.content}</div>)}{active && <div className="flex gap-2"><input className="h-10 flex-1 rounded-md border border-[#d8dcee] px-3 text-[11px]" value={content} onChange={(e) => setContent(e.target.value)} /><ActionButton variant="primary" onClick={async () => { await communicationAPI.postMessage(active, { content }); const res = await communicationAPI.listMessages(active); setMessages(unwrapData<any[]>(res)); setContent(''); }}>Send</ActionButton></div>}</Card></div>;
}

export function InstructorAnalyticsPage() {
  const { data, loading, error } = useAsyncResource(() => analyticsAPI.getInstructorStats(), []);
  return <div className="space-y-5"><PageHeading title="Analytics" subtitle="Live instructor course stats" /><ErrorCard error={error} />{loading ? <EmptyCard text="Loading analytics..." /> : <Card className="space-y-3">{(data || []).map((row: any, index: number) => <div key={index}><p className="text-[12px] font-semibold text-[#1d245d]">{row.courseTitle || row.title || `Course ${index + 1}`}</p><ProgressBar value={Math.round(row.averageProgress || row.progress || 0)} /></div>)}</Card>}</div>;
}

export function InstructorProfilePage() {
  const { user } = useAuthStore();
  return <div className="max-w-[760px] space-y-5"><div className="flex justify-start"><LinkButton to="/instructor/profile/edit" variant="secondary">Edit Profile</LinkButton></div><Card><p className="text-[28px] font-semibold text-[#1f2560]">{`${user?.firstName || ''} ${user?.lastName || ''}`.trim()}</p><p className="text-[11px] text-[#6e75a0]">{user?.email}</p><p className="text-[11px] text-[#2f356f]">{user?.bio || 'Instructor profile powered by live account data.'}</p></Card></div>;
}

export function InstructorEditProfilePage() {
  const { user, setUser } = useAuthStore();
  const [bio, setBio] = useState(user?.bio || '');
  const [saving, setSaving] = useState(false);
  return <div className="max-w-[760px] space-y-5"><PageHeading title="Edit Profile" /><Card className="space-y-3"><textarea className="min-h-[120px] rounded-md border border-[#d8dcee] px-3 py-2 text-[11px]" value={bio} onChange={(e) => setBio(e.target.value)} /><ActionButton loading={saving} variant="primary" onClick={async () => { setSaving(true); try { await accountAPI.updateSettings({ bio }); setUser(user ? { ...user, bio } : user); } finally { setSaving(false); } }}>Save Changes</ActionButton></Card></div>;
}

export function InstructorAnnouncementsPage() {
  const { data, loading, error } = useAsyncResource(() => announcementsAPI.listAnnouncements(), []);
  return <div className="max-w-[860px] space-y-5"><PageHeading title="Announcements" action={<LinkButton to="/instructor/announcements/new" variant="secondary">+ Add Announcement</LinkButton>} /><ErrorCard error={error} />{loading ? <EmptyCard text="Loading announcements..." /> : <div className="space-y-2">{(data || []).map((row: any) => <Card key={row.id}><p className="text-[12px] font-semibold text-[#2f356f]">{row.title}</p><p className="mt-1 text-[11px] text-[#646b95]">{row.content}</p><p className="mt-1 text-[10px] text-[#a0a6c4]">{formatDate(row.createdAt)}</p></Card>)}</div>}</div>;
}

export function InstructorAddAnnouncementPage() {
  return <AnnouncementForm />;
}

export function InstructorSettingsPage() {
  const { data: settings, loading } = useAsyncResource(() => roleSettingsAPI.getInstructorSettings(), {} as any);
  const [form, setForm] = useState<any>({}); const [saving, setSaving] = useState(false);
  useEffect(() => setForm(settings?.settings || settings || {}), [settings]);
  return <div className="max-w-[860px] space-y-6"><PageHeading subtitle="Manage your account and preferences." title="Settings" />{loading ? <EmptyCard text="Loading settings..." /> : <Card className="space-y-3">{['assignmentReminders','announcements','submissionNotifications','discussionAlerts'].map((key) => <label key={key} className="flex items-center justify-between rounded-md border border-[#e1e4f2] px-4 py-3"><span className="text-[12px] font-medium text-[#1d245d]">{key}</span><input checked={Boolean(form[key])} onChange={(e) => setForm({ ...form, [key]: e.target.checked })} type="checkbox" className="h-5 w-5 accent-[#08107b]" /></label>)}<ActionButton loading={saving} variant="primary" onClick={async () => { setSaving(true); try { await roleSettingsAPI.updateInstructorSettings({ settings: form }); } finally { setSaving(false); } }}>Save Settings</ActionButton></Card>}</div>;
}

export function InstructorChangeEmailPage() {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [saving, setSaving] = useState(false);
  return <div className="max-w-[600px] space-y-5"><PageHeading title="Change Email Address" /><Card className="space-y-3"><input className="h-9 w-full rounded-md border border-[#d8dcee] px-2 text-[11px]" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="New email" /><input className="h-9 w-full rounded-md border border-[#d8dcee] px-2 text-[11px]" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Current password" type="password" /><ActionButton loading={saving} variant="primary" onClick={async () => { setSaving(true); try { await accountAPI.changeEmail(email, password); } finally { setSaving(false); } }}>Save New Email</ActionButton></Card></div>;
}

export function InstructorChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState(''); const [newPassword, setNewPassword] = useState(''); const [saving, setSaving] = useState(false);
  return <div className="max-w-[600px] space-y-5"><PageHeading title="Change Password" /><Card className="space-y-3"><input className="h-9 w-full rounded-md border border-[#d8dcee] px-2 text-[11px]" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Current password" type="password" /><input className="h-9 w-full rounded-md border border-[#d8dcee] px-2 text-[11px]" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password" type="password" /><ActionButton loading={saving} variant="primary" onClick={async () => { setSaving(true); try { await accountAPI.changePassword(currentPassword, newPassword); } finally { setSaving(false); } }}>Save New Password</ActionButton></Card></div>;
}
