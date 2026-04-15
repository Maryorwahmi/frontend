import { Outlet } from 'react-router-dom';
import { NavDot, TalentFlowShell, type NavSection } from '@/shared/ui/talentFlow';

const instructorNavSections: NavSection[] = [
  {
    label: 'Teach',
    items: [
      { label: 'Dashboard', to: '/instructor', icon: <NavDot />, exact: true },
      { label: 'My Courses', to: '/instructor/courses', icon: <NavDot /> },
      { label: 'Submissions', to: '/instructor/submissions', icon: <NavDot /> },
      { label: 'Create courses', to: '/instructor/courses/create', icon: <NavDot /> },
    ],
  },
  {
    label: 'Manage',
    items: [
      { label: 'Learners', to: '/instructor/learners', icon: <NavDot /> },
      { label: 'Discussion', to: '/instructor/discussion', icon: <NavDot /> },
      { label: 'Analytics', to: '/instructor/analytics', icon: <NavDot /> },
      { label: 'Announcement', to: '/instructor/announcements', icon: <NavDot /> },
      { label: 'Profile', to: '/instructor/profile', icon: <NavDot /> },
      { label: 'Settings', to: '/instructor/settings', icon: <NavDot /> },
    ],
  },
];

export function InstructorLayout() {
  return (
    <TalentFlowShell
      navSections={instructorNavSections}
      primaryAction={{ label: 'Create courses', to: '/instructor/courses/create' }}
      searchPlaceholder="Search Courses,lessons..."
    >
      <Outlet />
    </TalentFlowShell>
  );
}

export default InstructorLayout;
